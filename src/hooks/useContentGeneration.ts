import { useState } from 'react';

const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePost = async (options) => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://api.example.com/generatePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, content: data.content };
      } else {
        return { success: false, error: data.message || 'Failed to generate content' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  };

  return { isGenerating, generatePost, copyToClipboard };
};

export default useContentGeneration;
