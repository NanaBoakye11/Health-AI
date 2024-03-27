"use client"
import React, { useState, useRef, useEffect} from 'react';

// Interface for the message object
interface Message {
  sender: string;
  message: string;
}

export default function Home() {
  const [input, setInput] = useState('');
  // const [zipcode, setZipcode] = useState('')
  const [history, setHistory] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); 
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);


  const askMe = async () => {
    if (input.trim() === '') return;
    setIsProcessing(true); // Start processing
    setHistory([...history, { sender: 'User', message: input }]);

    try {
      // API call to endpoint
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      console.log("API Response:", data); 

      //AI's response to the history
      setHistory(prev => [...prev, { sender: 'AI', message: data.response }]);
    } catch (error) {
      console.error('There was an error in the API request:', error);
    }

    
    setInput('');
    setIsProcessing(false);
  };


  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-700 text-white">
      <h1 className="text-3xl font-bold mb-4">Health AI Chatbot</h1>
      <div className="overflow-y-auto w-full max-w-md bg-white text-black rounded-lg shadow p-4 space-y-4" style={{ height: '60vh' }}>
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'AI' ? 'flex-row-reverse' : ''}`}>
            <div className={`rounded-lg px-4 py-2 ${msg.sender === 'AI' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <p className="font-semibold">{msg.sender}</p>
              <p className="text-gray-800">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      <textarea
        className="w-full max-w-md mt-4 p-2 border-none rounded-md shadow-inner text-black"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question here..."
      ></textarea>
      <button
        className="mt-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition duration-150 ease-in-out"
        onClick={askMe}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Ask'}
      </button>
    </div>
  );
}


























































// export default function Home() {
//   return (
//     <div className="flex flex-col h-screen justify-center items-center bg-gray-100 text-black">
//       Welcome To Health AI 
//       <div className="w-full max-w-3xl max-auto p-6">
//         {/* Conversational History Section */}
//         <div className="mb-4 bg-white p-4 shadow-md rounded-lg w-full text-black">
//           {/* Here you will dynamically list the conversational history */}
//           <p>Assistant: How can I help you today?</p>
//           {/* More messages will go here */}
//         </div>

//         {/* Textarea and Button */}
//         <textarea 
//           className="w-full p-4 mb-4 shadow-md rounded-lg resize-none text-black"
//           rows={6}
//           placeholder="Type your message here..."
//         />
//         <button className="w-full py-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg">
//           Health AI
//         </button>
//       </div>
//     </div>
//   );
// }









// export default function Home() {
//   return (
//     <p>Health AI</p>
//   );
// }
