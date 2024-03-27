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
      content: "",
      relatedSites: [2],
    },
    {
      documentID: 2,
      title: "Mental Health Resources",
      content: "",
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
  const ipAddress = request.headers.get('X-Forwarded-For')?.split(',').shift() || '8.8.8.8';
    const body = await request.json();
    const userId = body.userID;
    const query = body.query;
    const zipcode = await getZipcodeFromIP(ipAddress) as string || "unknown";
    console.log("This is the Zipcode retrieved from the IpStack function " + zipcode);

    const user = users.find(user => user.userID === 1); 

  
    const userName = user?.username;
    const userDisability = user?.disabilty;
    const userInterests = user?.preferences.interests.join(', ');
    const userZipCode = zipcode;

  let context = `You're a chatbot for disabled patients. Here's the user's name ${userName}, with this disability ${userDisability}, and is currently located in this zipcode ${userZipCode}. 
                1. First formally greet the user by their name ${userName}. 
                2. Then break down the user's question into pieces to fully understand their request.
                3. Check your resources and other external resources to find relative information about the request.
                4. If the question requires finding nearby services, use their zipcode ${userZipCode} to search for services related their question and retrieve their contact details ready to provide to the user.
                5. In addition, compare your findings with the user's question to see if your findings align with the question.
                6. Finally, if your comparison aligns with the user's request, provide a response to the user in 4-5 sentences.
                If your comparison doesn't align with the question, redo the steps over until the findings align with the question before you respond`;

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




















