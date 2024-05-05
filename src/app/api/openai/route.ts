// src/app/api/openai/route.ts


import OpenAI from "openai";
import fetch from 'node-fetch';
import { resolve } from "path";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MessageContentText {
  text: {
    value: string;
  };
}

interface ApiResponse {
  zip?: string;
}

interface AssistantMessage {
  role: string;
  content: MessageContentText[]; // Array of MessageContentText
}

const assistant_id = 'asst_wp9RboSfahxovZhshpe0TBqN'
const fileAttached = 'file-2vsKouv1X3hImBW5rvzeNOeK'

const users = [
    {
      userID: 1,
      username: "John Doe",
      disability: "Autism Spectrum Disorder",
      preferences: {
        interests: ["Health education", "Physical activities for special needs"],
        accessibilityNeeds: ["Quiet environments", "Visual schedules"],
      },
    },
    {
      userID: 2,
      username: "Jane Smith",
      disability: "Hearing Impairment",
      preferences: {
        interests: ["Sign language resources", "Lip reading techniques", "Nutritional advice"],
        accessibilityNeeds: ["Text-based communication", "Hearing aid compatible technology"],
      },
    },
    {
      userID: 3,
      username: "Terry Johnson",
      disability: "Post-Stroke Rehabilitation",
      preferences: {
        interests: ["Stroke recovery exercises", "Adaptive transportation options"],
        accessibilityNeeds: ["Handicap accessible facilities", "Speech therapy resources"],
      },
    },
    {
      userID: 4,
      username: "Sandy Mills",
      disability: "Visual Impairment",
      preferences: {
        interests: ["Braille learning tools", "Stress management for the visually impaired", "Accessible public transportation"],
        accessibilityNeeds: ["Screen reader software", "Guide dog friendly spaces"],
      },
    },
    {
      userID: 5,
      username: "Eric Lu",
      disability: "Epilepsy",
      preferences: {
        interests: ["Seizure management techniques", "Epilepsy friendly fitness regimes", "Transportation safety for epilepsy"],
        accessibilityNeeds: ["Seizure alert devices", "Epilepsy support groups"],
      },
    },
    {
      userID: 6,
      username: "Charles Henry",
      disability: "Type 1 Diabetes",
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
  
  const files = [
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
  

  async function handlePost(request: Request) {
  let finalResponse = ""; 
  const { userID, query } = await request.json();
  const ipAddress = request.headers.get('X-Forwarded-For')?.split(',').shift() || '8.8.8.8';
  console.log(ipAddress);
  const zipcode = await getZipcodeFromIP(ipAddress) as string || "unknown";
  const user = users.find(user => user.userID === 1);

  console.log("Here's the Main QUERY", query);
  

  const queryQueue = [];
  let pushQuery = queryQueue.push(query);

  console.log("HERE'S history Array   ", queryQueue);

  
    if (!user) {
      return new Response(JSON.stringify({ response: "User not found. Please login" }),{
        headers: {'Content-Type': 'application/json'},
      });
    }
  

    const instructions = `
                        My name is ${user.username}.
                        I have ${user.disability} disability.  
                        This is my zipcode ${zipcode}.
                        You are a compassionate and knowledgeable AI chatbot designed to support disabled patients. 
                        Your tone should be friendly and helpful. Please Keep your answers short!
                        Please arrange answer in bulletin points!
                        Use the information contained in the provided files ${fileAttached} to answer questions about disabled patients such as recommendations, services, transportation, etc.
                          `;
    

    const fullQuery = `You are a great social worker.
                        My name is ${user.username}.
                        I have ${user.disability} disability and require ${user.preferences.accessibilityNeeds}.
                         ${query}.
                        I'm currently live in the zip code ${zipcode}.
                        Can you please look within 10 miles?
                        Check this file ${fileAttached} for any relavant information!!
                        Please make sure that their phone numbers are verified one, and include their website.
                        Please provide this information in a tabular format?
                        Please indicate if a session can be booked online?
                        Please generate a personalized  referral message as a JSON object to the second provider on the list.
                        `
                          
    try {
      // Create a thread
      const thread = await openai.beta.threads.create({
        messages: [
          {
            role: "user",
            content: query,
            attachments: [{file_id: fileAttached, tools: [{ type: "file_search" }] }]
          }
        ]
      });

      console.log("THREAD: ", thread);

      let run = await openai.beta.threads.runs.create(
        thread.id, 
        {
          assistant_id: assistant_id,
          model: "gpt-4-turbo",
          instructions: instructions,
        }
      );
    

      while (run.status !== "completed"){
        run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
        console.log(`Run status: ${run.status}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log("Run completed");

      
        const messagesResponse = await openai.beta.threads.messages.list(run.thread_id);
        const messages = messagesResponse.data;
        console.log(messages);
        let latest_message = messages[0];
        if ('text' in latest_message.content[0]){
          finalResponse = latest_message.content[0].text.value;
          console.log(`Response: ${finalResponse}`);
        } else {
          console.log("The latest message does not have text content.");
        }
      } catch (error) {
        console.error("Error creating or querying assistant:", error);
    finalResponse = "An error occurred while processing your request. Please rephrase your question and try again!";
      }

      // }
      console.log("Final Response before sending to FrontEnd ", finalResponse);
      // Return response
      return new Response(JSON.stringify({ response: finalResponse }), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } 
  export async function POST(request: Request) {
    return await handlePost(request);
  }




















//   KEEP ANSWERS SHORT!! You are a compassionate and knowledgeable AI chatbot. Your name is Jefflin Bot.
//   Your task is to research disbaled patients queries and provide them with valuable information.
//   Please be interactive like an actual human conversation. 
//   Hence the user's name is ${user.username}, with ${user.disability} disability, and 
//   located in ZIP code ${zipcode}. 
//   Response should be about 3 sentences!
//   Your response should be detailed and efficient. Please Keep your response short and precise, this is very important
//   Before you answer, check these files ${ids} and information like name ${user.username}, ${zipcode}, ${user.disability} for any relevant information related to thier question ${query}!
//   If there's no relative information in the ${ids} files, remember ignore the files and answer on your own please! Check other external resources!
//   Example: USER INPUT: 'Are there any programs or initiatives that offer job training or employment support for disabled individuals?

//  Keep in mind this example when answering user queries!
//  DO NOT INCLUDE REFERENCING THE FILES AND DOCUMENTS IN YOUR RESPONSE TO THE USER!
//  DO NOT LIST or include the file source in your response!
 
//   Understand their unique needs and go through these files ${ids} and information like name ${user.username}, zipcode ${zipcode}, and disability ${user.disability} for any relevant information related to thier question which is, ${query}!
//   If there's no relative information in the ${ids} files, Use your own knowledgebase to answer!

