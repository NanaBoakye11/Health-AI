// src/app/api/openai/route.ts


import OpenAI from "openai";
import fetch from 'node-fetch';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


interface ApiResponse {
  zip?: string;
}

const users = [
    {
      userID: 1,
      username: "John Doe",
      disabilty: "Autism Spectrum Disorder",
      preferences: {
        interests: ["Health education", "Physical activities for special needs"],
        accessibilityNeeds: ["Quiet environments", "Visual schedules"],
      },
    },
    {
      userID: 2,
      username: "Jane Smith",
      disabilty: "Hearing Impairment",
      preferences: {
        interests: ["Sign language resources", "Lip reading techniques", "Nutritional advice"],
        accessibilityNeeds: ["Text-based communication", "Hearing aid compatible technology"],
      },
    },
    {
      userID: 3,
      username: "Terry Johnson",
      disabilty: "Post-Stroke Rehabilitation",
      preferences: {
        interests: ["Stroke recovery exercises", "Adaptive transportation options"],
        accessibilityNeeds: ["Handicap accessible facilities", "Speech therapy resources"],
      },
    },
    {
      userID: 4,
      username: "Sandy Mills",
      disabilty: "Visual Impairment",
      preferences: {
        interests: ["Braille learning tools", "Stress management for the visually impaired", "Accessible public transportation"],
        accessibilityNeeds: ["Screen reader software", "Guide dog friendly spaces"],
      },
    },
    {
      userID: 5,
      username: "Eric Lu",
      disabilty: "Epilepsy",
      preferences: {
        interests: ["Seizure management techniques", "Epilepsy friendly fitness regimes", "Transportation safety for epilepsy"],
        accessibilityNeeds: ["Seizure alert devices", "Epilepsy support groups"],
      },
    },
    {
      userID: 6,
      username: "Charles Henry",
      disabilty: "Type 1 Diabetes",
      preferences: {
        interests: ["Diabetic diet plans", "Exercise for diabetes management"],
        accessibilityNeeds: ["Glucose monitoring assistance", "Insulin therapy resources"],
      },
    }
  ];
  
  const sites = [
    {
      siteID: 1,
      url: "https://ezride.org/",
      description: "A comprehensive health transportation site.",
      category: "Transportation",
      summary: "EZ Ride offers a range of services to assist with transportation for health-related needs, including accessible vehicles for those with mobility challenges.",
  
    },
    {
      siteID: 2,
      url: "https://www.pennmedicine.org/",
      description: "An app for tracking fitness goals.",
      category: "Fitness",
      summary: "Penn Medicine is shaping the future of patient care. A hub of cutting-edge research and collaboration, we turn the latest discoveries into innovative new treatments every day.",
  
    },
    {
      siteID: 3,
      url: "https://www.google.com/",
      description: "An app for tracking fitness goals.",
      category: ["Fitness", "Transportation"],
      summary: "",
  
    }
  
  ];
  
  const documents = [
    {
      documentID: 1,
      title: "Guide to Accessible Fitness Centers",
      content: "Content or URL to the document...",
      relatedSites: [2],
    },
    {
      documentID: 2,
      title: "Mental Health Resources",
      content: "Content or URL to the document...",
      relatedSites: [1],
    },
  ];

async function getZipcodeFromIP(ipAddress: string): Promise<string | null> {
    const ipStackApiKey = process.env.IPSTACK_API_KEY;
    if(!ipStackApiKey) {
      console.error('StackAPI Key is missing.');
      return 'unknown'
    }
    const url = `http://api.ipstack.com/${ipAddress}?access_key=${ipStackApiKey}&fields=zip`;
    try {
      const response = await fetch(url);
      const data = await response.json() as ApiResponse;
      console.log("IPStack Data:", data);
      if (data.zip) {
        const zipData = data.zip;
        console.log(`Zipcode for IP ${ipAddress}: ${zipData}`);
        console.log(zipData);
        return zipData;
      } else {
        console.log(`No zipcode found for IP ${ipAddress}. Response:`, data);
        return 'unknown';
      }
    } catch (error) {
      console.error('Error fetching geolocation data:', error);
      return 'unknown';
    }
  }
  

export async function POST(request: Request) {
  const ipAddress = request.headers.get('X-Forwarded-For')?.split(',').shift() || '8.8.8.8'; // Fallback IP for testing
    const body = await request.json();
    const userId = body.userID;
    const query = body.query;
    const zipcode = await getZipcodeFromIP(ipAddress) as string || "unknown";
    console.log("This is the Zipcode retrieved from the IpStack function " + zipcode);

    const user = users.find(user => user.userID === 1); // Replace 1 with the appropriate user ID logic

  
    const userName = user?.username;
    const userDisability = user?.disabilty;
    const userInterests = user?.preferences.interests.join(', ');
    const userZipCode = zipcode;

  let context = `Hence this is the user's information. Use this to information to answer the user's questions. Here are the information -- > The user, ${userName}, with ${userDisability}. They are located in the ZIP code ${userZipCode}. Based on this information, provide detailed responses to their queries such as phone number and address. Don't mention "based on your zipcode you provided". Just go straight to completely answering their questions fully. Provide great suggestions by doing your research and answering in detail. Please finish your by providing them a list of what they are asking for based on their location!.`;

  console.log('This is IPAddress '+ ipAddress);

  const fullQuery = `${query} ${context}`;


  try {
    // Call the OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: fullQuery }],
      model: "gpt-3.5-turbo",
    });
    const aiResponse = chatCompletion.choices[0].message.content;
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




















