// src/app/api/openai/route.ts

import OpenAI from "openai";
import fetch from 'node-fetch';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// async function testGeolocationAPI(ipAddress) {
//   const ipStackApiKey = process.env.IPSTACK_API_KEY; // Replace with your actual API key
//   const url = `http://api.ipstack.com/${ipAddress}?access_key=${ipStackApiKey}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error('Error fetching geolocation data:', error);
//   }
// }

// testGeolocationAPI('8.8.8.8');

interface ApiResponse {
  zip?: string;
}

async function getZipcodeFromIP(ipAddress: string): Promise<string> {
  const ipStackApiKey = process.env.IPSTACK_API_KEY;
  if(!ipStackApiKey) {
    console.error('StackAPI Key is missing.');
    return 'unknown'
  }
  const url = `http://api.ipstack.com/${ipAddress}?access_key=${ipStackApiKey}&fields=zip`;
  try {
    const response = await fetch(url);
    const data = await response.json() as ApiResponse;
    if (data.zip) {
      console.log(`Zipcode for IP ${ipAddress}: ${data.zip}`);
      return data.zip;
    } else {
      console.log(`No zipcode found for IP ${ipAddress}. Response:`, data);
      return 'unknown';
    }
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    return 'unknown';
  }
}

function extractClientIP(request: Request): string {
  const forwardedIp = request.headers.get('X-Forwarded-For');
  return forwardedIp ? forwardedIp.split(',')[0] : 'unknown';
}

export async function POST(request: Request) {
  const ipAddress = extractClientIP(request);
  const body = await request.json();
  const query = body.query;
  let context = "This query is coming from an IP address, which might indicate the user's general location. Check google with the provided zipcode to answer the question as needed. Use this information to provide a tailored response .Hence assume this is a disabled patient asking you this question. Do not let the response show that you're googling answers";

  console.log('This is IPAddress '+ ipAddress);

  // const zipcode = ipAddress ? await getZipcodeFromIP(ipAddress) : 'unknown';

  const fullQuery = `${query} ${context} IP Address: ${ipAddress}.`;



  try {
    // Call the OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: fullQuery }],
      model: "gpt-3.5-turbo",
    });

    const aiResponse = chatCompletion.choices[0].message.content;

    // Fetch places using Google Places API
    // You need to extract the location from the user's request or use a default one
    // const location = '40.7128,-74.0060'; // Example: New York City coordinates
    // const places = await fetchPlaces(query, location);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ response: "An error occurred." }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 500 // Internal Server Error
    });
  }
}






























// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_API_KEY; 

// async function fetchPlaces(query, location) {
//  // Ensure you have an API key
//  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location}&radius=5000&key=${GOOGLE_PLACES_API_KEY}`;
//  try {
//   const response = await fetch(url);
//   const data = await response.json();
//   return data.results;
// } catch (error) {
//   console.error('Error fetching places:', error);
//   return [];
// }
// }


// export async function POST(request: Request) {
//     // Parse the JSON body from the request
//     const body = await request.json();
//     let filter = '. Hence assume this is a didabled patient asking you this question. Also remember use current location to answer location based questions';
//     const query = `${body.query}`;

//     // if (body.location && body.location.latitude && body.location.longitude) {
//     //   filter += ` The user's current location is approximately latitude ${body.location.latitude} and longitude ${body.location.longitude}.`;
//     // }
  
//     // const fullQuery = `${query} ${filter}`;

//     try {
//       const chatCompletion = await openai.chat.completions.create({
//         messages: [{ role: "user", content: query }],
//         model: "gpt-3.5-turbo",
//     });
    
//     const aiResponse = chatCompletion.choices[0].message.content;

//     const externalData = await fetchExternalData(query);

//     const combinedResponse = `${aiResponse} Here are some suggestions based on your query: ${externalData}`;


//     console.log (externalData);
//     console.log(chatCompletion);
//     console.log(aiResponse)

//     return new Response(JSON.stringify({ response: combinedResponse}), {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     } catch (error) {
//       console.error("Error calling OpenAI:", error);

//       return new Response(JSON.stringify({ response: "An error occured. "}), {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         status: 500 //internal Server Error
//       });
//     }
//   }
  


  // ${filter}