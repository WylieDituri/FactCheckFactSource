"""""
from google.adk.agents.llm_agent import Agent

root_agent = Agent(
    model='<FILL_IN_MODEL>',
    name='root_agent',
    description='A helpful assistant for user questions.',
    instruction='Answer user questions to the best of your knowledge',
)
"""""


# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import google_search
from google.genai import types
import asyncio

APP_NAME="google_search_agent"
USER_ID="user1234"
SESSION_ID="1234"


root_agent = Agent(
    name="basic_search_agent",
    model="gemini-3-pro-preview",
    description="""
        An AI agent that helps users verify the truthfulness of their queries by searching the internet.
        """,
    instruction="""
        You a helpful AI agent that will help users check whether their queries contain true or false information by searching the internet.
        When the user asks a question pertaining to text information, you will ask the user to highlight the text in question.
        Then, you will perform a Google search to verify the information, provide a concise summary of your findings, and the sources that support the verified information.
        When the user asks a question that pertains to audio information, you will ask the user to play the audio clip until the user has stopped playing the audio.
        Then, you will perform a Google search to verify the information, provide a concise summary of your findings, and the sources that support the verified information.
        
        Your response should be in this format:
        
        Claim: <repeat the claim in question>
        Search Summary: <your concise summary of the search results>
        Sources: <list of sources that support your summary>
        Verification: <True/False/Unverifiable>
        
        """,
    # google_search is a pre-built tool which allows the agent to perform Google searches.
    tools=[google_search]
)

# Session and Runner
async def setup_session_and_runner():
    session_service = InMemorySessionService()
    session = await session_service.create_session(app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID)
    runner = Runner(agent=root_agent, app_name=APP_NAME, session_service=session_service)
    return session, runner

# Agent Interaction
async def call_agent_async(query):
    content = types.Content(role='user', parts=[types.Part(text=query)])
    session, runner = await setup_session_and_runner()
    events = runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=content)

    async for event in events:
        if event.is_final_response():
            final_response = event.content.parts[0].text
            print("Agent Response: ", final_response)

# Note: In Colab, you can directly use 'await' at the top level.
# If running this code as a standalone Python script, you'll need to use asyncio.run() or manage the event loop.

if __name__ == "__main__":
    asyncio.run(call_agent_async("what's the latest ai news?"))