"use client"
// import React, { useState, useEffect } from 'react';

// // Define an interface for the message object
// interface Message {
//   sender: string;
//   message: string;
// }

// export default function Home() {
//   const [input, setInput] = useState('');
//   const [history, setHistory] = useState<Message[]>([]);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });

//   useEffect(() => {
//     // Get user's location when the component mounts
//     getUserLocation();
//   }, []);

//   const getUserLocation = () => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition((position) => {
//         setUserLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude
//         });
//       }, (error) => {
//         console.error("Error obtaining location: ", error);
//       });
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   };

//   const askMe = async () => {
//     if (input.trim() === '') return;
//     setIsProcessing(true); // Start processing
//     setHistory([...history, { sender: 'User', message: input }]);

//     try {
//       // Include userLocation in the API request if needed
//       const requestBody = {
//         query: input,
//         location: userLocation // This sends the user's location with the query
//       };

//       // Make an API call to your endpoint
//       const response = await fetch('/api/openai', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();
//       console.log("API Response:", data); // Debugging

//       // Add AI's response to the history
//       setHistory(prev => [...prev, { sender: 'AI', message: data.response }]);
//     } catch (error) {
//       console.error('There was an error in the API request:', error);
//     }

//     setInput('');
//     setIsProcessing(false); // Stop processing
//   };


  import React, { useState } from 'react';

// Define an interface for the message object
interface Message {
  sender: string;
  message: string;
}

export default function Home() {
  const [input, setInput] = useState('');
  // const [zipcode, setZipcode] = useState('')
  const [history, setHistory] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // State to track processing status

  const askMe = async () => {
    if (input.trim() === '') return;
    setIsProcessing(true); // Start processing
    setHistory([...history, { sender: 'User', message: input }]);

    try {
      // Make an API call to your endpoint
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Debugging

      // Add AI's response to the history
      setHistory(prev => [...prev, { sender: 'AI', message: data.response }]);
    } catch (error) {
      console.error('There was an error in the API request:', error);
    }

    // Clear the input field and stop processing
    setInput('');
    // setZipcode('');
    setIsProcessing(false); // Stop processing
  };


  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100 text-black">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Welcome To Health AI</h1>
      <div className="overflow-y-auto w-2/3 md:w-1/2 lg:w-1/3 bg-white rounded-lg shadow p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`overflow-y-auto text-left pl-2 border-l-4 ${msg.sender === 'AI' ? 'border-blue-500' : 'border-green-500'}`}>
            <strong>{msg.sender}:</strong> <span className="text-gray-600">{msg.message}</span>
          </div>
        ))}
      </div>
      <textarea
        className="w-2/3 md:w-1/2 lg:w-1/3 h-40 mt-4 p-2 border border-gray-300 rounded shadow-inner text-black"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question here..."
      ></textarea>
      <button
        className="mt-2 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
        onClick={askMe}
        disabled={isProcessing} // Button is disabled when isProcessing is true
      >
        {isProcessing ? 'Processing...' : 'Ask Health AI'}
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
