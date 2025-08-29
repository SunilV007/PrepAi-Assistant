import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Loader, Download, Share } from 'lucide-react';
import axios from 'axios';

function Validation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallSummary, setOverallSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!location.state?.questions || !location.state?.answers || !location.state?.interviewData) {
      navigate('/create');
      return;
    }
    generateFeedback();
  }, [location, navigate]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const generateFeedback = async () => {
    const { questions, answers, interviewData } = location.state;
    setLoading(true);

    try {
      const feedbackPromises = questions.map(async (question, index) => {
        // Skip evaluation for skipped questions
        if (answers[index] === "Question skipped") {
          return {
            question,
            answer: answers[index],
            feedback: "Rating: 0\nDetailed feedback: Question was skipped by the candidate.\nAreas of improvement: Consider practicing this question to improve your knowledge in this area.",
            geminiFeedback: {
              detailed_feedback: "Question was skipped by the candidate.",
              strengths: ["N/A"],
              areas_for_improvement: ["Consider practicing this question to improve your knowledge in this area."],
              technical_accuracy: "N/A",
              communication_clarity: "N/A",
              overall_rating: "0"
            }
          };
        }

        // Use the evaluation content type from the Python backend
        const response = await axios.post(`${API_URL}/chat`, {
          content_type: "evaluation",
          role: interviewData.jobRole,
          technology: interviewData.techStack,
          level: getExperienceLevel(interviewData.experience),
          question: question,
          answer: answers[index]
        });

        // Extract feedback from response
        return {
          question,
          answer: answers[index],
          feedback: response.data.response,
          geminiFeedback: response.data.gemini_feedback || null
        };
      });

      const feedbackResults = await Promise.all(feedbackPromises);
      setFeedback(feedbackResults);
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
    setLoading(false);
  };

  const getExperienceLevel = (experienceYears) => {
    const years = parseInt(experienceYears);
    if (years > 5) return "Advanced";
    if (years > 2) return "Intermediate";
    return "Basic";
  };

  const generateOverallSummary = async () => {
    const { interviewData } = location.state;
    setGeneratingSummary(true);

    try {
      // Create a summary of all questions and feedback
      const summaryContent = feedback.map((item, index) => {
        return `Question ${index + 1}: ${item.question}\nAnswer: ${item.answer}\nFeedback: ${item.feedback}\n`;
      }).join('\n');

      // Request overall summary from the backend
      const response = await axios.post(`${API_URL}/chat`, {
        message: `
          You are an interview evaluator for a ${interviewData.jobRole} position.
          Please provide an overall assessment of this candidate based on the following interview:
          
          ${summaryContent}
          
          Give an executive summary of their performance, highlighting strengths, major areas for improvement, 
          and guidance on what they should focus on to better prepare for a real interview.
          Keep your response structured and under 300 words.
        `
      });

      setOverallSummary(response.data.response);
    } catch (error) {
      console.error('Error generating overall summary:', error);
      setOverallSummary('Failed to generate overall summary. Please try again.');
    }
    setGeneratingSummary(false);
  };

  const exportResults = () => {
    const { questions, answers, interviewData } = location.state;
    
    // Create a formatted text for export
    let exportContent = `# PrepAI Interview Results\n\n`;
    exportContent += `## Interview Details\n`;
    exportContent += `- Position: ${interviewData.jobRole}\n`;
    exportContent += `- Experience Level: ${interviewData.experience} years\n`;
    exportContent += `- Tech Stack: ${interviewData.techStack}\n\n`;
    
    // Add average rating
    exportContent += `## Overall Rating: ${averageRating}/5\n\n`;
    
    // Add each question with feedback
    exportContent += `## Question by Question Analysis\n\n`;
    feedback.forEach((item, index) => {
      exportContent += `### Question ${index + 1}: ${item.question}\n\n`;
      exportContent += `**Your Answer:**\n${item.answer}\n\n`;
      
      // Format feedback - prefer Gemini feedback if available
      if (item.geminiFeedback) {
        exportContent += `**Rating:** ${item.geminiFeedback.overall_rating}/5\n\n`;
        exportContent += `**Detailed Feedback:**\n${item.geminiFeedback.detailed_feedback}\n\n`;
        exportContent += `**Strengths:**\n${item.geminiFeedback.strengths.map(s => `- ${s}`).join('\n')}\n\n`;
        exportContent += `**Areas for Improvement:**\n${item.geminiFeedback.areas_for_improvement.map(a => `- ${a}`).join('\n')}\n\n`;
        exportContent += `**Technical Accuracy:** ${item.geminiFeedback.technical_accuracy}\n\n`;
        exportContent += `**Communication Clarity:** ${item.geminiFeedback.communication_clarity}\n\n`;
      } else {
        // Fallback to original format
        const sections = parseFeedback(item.feedback);
        exportContent += `**Rating:** ${sections.rating}/5\n\n`;
        exportContent += `**Detailed Feedback:**\n${sections.detailed}\n\n`;
        exportContent += `**Areas for Improvement:**\n${sections.improvement}\n\n`;
      }
      exportContent += `---\n\n`;
    });
    
    // Add overall summary if available
    if (overallSummary) {
      exportContent += `## Overall Assessment\n\n${overallSummary}\n`;
    }
    
    // Create and download the file
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrepAI_${interviewData.jobRole}_Interview_Results.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseFeedback = (feedback) => {
    return feedback.split('\n').reduce((acc, line) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('Rating:')) 
        acc.rating = parseInt(cleanLine.split(':')[1]) || 0;
      else if (cleanLine.startsWith('Detailed feedback:')) 
        acc.detailed = cleanLine.substring(cleanLine.indexOf(':') + 1).trim();
      else if (cleanLine.startsWith('Areas of improvement:')) 
        acc.improvement = cleanLine.substring(cleanLine.indexOf(':') + 1).trim();
      return acc;
    }, { rating: 0, detailed: '', improvement: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <h2 className="text-xl font-medium">Analyzing Your Responses</h2>
          <p className="text-gray-400">Generating comprehensive feedback...</p>
        </div>
      </div>
    );
  }

  const averageRating = feedback.length
    ? (feedback.reduce((acc, item) => {
        // Prefer Gemini rating if available
        if (item.geminiFeedback && item.geminiFeedback.overall_rating) {
          return acc + parseFloat(item.geminiFeedback.overall_rating);
        }
        const sections = parseFeedback(item.feedback);
        return acc + sections.rating;
      }, 0) / feedback.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Interview Analysis
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              Average Performance Rating: <span className="text-xl font-bold text-white">{averageRating}/5</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Results
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-6">
          {feedback.map((item, index) => {
            // Get feedback data - prefer Gemini feedback if available
            const hasGeminiFeedback = item.geminiFeedback && Object.keys(item.geminiFeedback).length > 0;
            const rating = hasGeminiFeedback 
              ? parseFloat(item.geminiFeedback.overall_rating || 0)
              : parseFeedback(item.feedback).rating;
            
            return (
              <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Question and Answer */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Question {index + 1}</h3>
                    <p className="text-gray-300 mb-4">{item.question}</p>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Your Answer:</h4>
                      <p className="text-gray-300">{item.answer}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-500'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-300">{rating}/5</span>
                  </div>

                  {/* Feedback Sections - Using Gemini feedback if available */}
                  {hasGeminiFeedback ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Detailed Feedback</h4>
                        <p className="text-gray-300">{item.geminiFeedback.detailed_feedback}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Strengths</h4>
                          <ul className="list-disc list-inside text-gray-300">
                            {item.geminiFeedback.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Areas for Improvement</h4>
                          <ul className="list-disc list-inside text-gray-300">
                            {item.geminiFeedback.areas_for_improvement.map((area, i) => (
                              <li key={i}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Technical Accuracy</h4>
                          <p className="text-gray-300">{item.geminiFeedback.technical_accuracy}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Communication Clarity</h4>
                          <p className="text-gray-300">{item.geminiFeedback.communication_clarity}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Fallback to original format
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Detailed Feedback</h4>
                        <p className="text-gray-300">{parseFeedback(item.feedback).detailed}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Areas for Improvement</h4>
                        <p className="text-gray-300">{parseFeedback(item.feedback).improvement}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Summary Section */}
        <div className="mt-8">
          {!overallSummary && !generatingSummary && (
            <button
              onClick={generateOverallSummary}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Generate Overall Assessment
            </button>
          )}

          {generatingSummary && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin mr-3 text-purple-500" />
              <span>Generating overall assessment...</span>
            </div>
          )}

          {overallSummary && (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4">Overall Assessment</h3>
              <p className="text-gray-300 whitespace-pre-line">{overallSummary}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Start New Interview
          </button>

          <button
  onClick={() => navigate('/dashboard')}
  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
>
  Go to Dashboard
</button>
        </div>
      </div>
    </div>
  );
}

export default Validation;