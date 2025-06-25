"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { selectedEventAtom, userDetailsAtom } from "@/lib/atoms";
import CallToAction from "@/components/home/call-to-action";
import FeatureHighlights from "@/components/home/feature-highlights";
import Header from "@/components/home/header";
import EventList from "@/components/home/EventList";
import Agent from "@/components/agent";
import { motion } from "framer-motion";
import UserDetailsForm from "@/components/UserDetailsForm";

export default function Home() {
  const [selectedEvent] = useAtom(selectedEventAtom);
  const [userDetails] = useAtom(userDetailsAtom);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAgent, setShowAgent] = useState(false);

  const handleEventSelect = () => {
    // Check localStorage first
    const savedUserDetails = localStorage.getItem('userDetails');
    if (savedUserDetails) {
      const details = JSON.parse(savedUserDetails);
      if (details.name && details.email) {
        setShowAgent(true);
        return;
      }
    }

    // Fallback to checking atom state
    if (userDetails && userDetails.name && userDetails.email) {
      setShowAgent(true);
    } else {
      setShowUserForm(true);
    }
  };

  const handleUserFormSubmit = () => {
    setShowUserForm(false);
    setShowAgent(true);
  };

  const handleBackToEvents = () => {
    setShowAgent(false);
    setShowUserForm(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute top-0 z-[-2] h-full w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] hidden dark:block"></div>
      <div className="absolute top-0 z-[-2] h-full w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)] dark:hidden"></div>

      {/* Main container with backdrop filter */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <Header />

          {/* Main content area */}
          <main className="relative flex-1 pb-24 space-y-20">
            {/* Events and Feedback Section */}
            <section className="py-12">
              {/* <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Recent Events</h2>
                <p className="text-lg text-muted-foreground">
                  Select an event to provide feedback
                </p>
              </div> */}

              {showUserForm ? (
                <div className="max-w-md mx-auto">
                  <UserDetailsForm onSubmit={handleUserFormSubmit} />
                </div>
              ) : showAgent ? (
                <Agent
                  type="feedback"
                  questions={[
                    "I am BuildFast Bot and I am here to collect feedback for the {event} and this call will take 3-5 min.",
                    "What do you do {name}?",
                    "How would you rate the {event} on a scale of one to ten, {name}?",
                    "What did you like most about the {event}?",
                    "What suggestions do you have to improve the {event}?",
                    "We have a 8 week Generative AI Launchpad; would you be interested, {name}?",
                    "Thanks for your feedback on the {event}, {name}. Have a great day!",
                  ]}
                  onCallComplete={() => {
                    setShowAgent(false);
                  }}
                  onBackToEvents={handleBackToEvents}
                />
              ) : (
                <>
                  <div className="max-w-4xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1 }}
                      className="mb-4"
                    >
                      <p className="text-foreground/70 text-sm bg-muted/50 px-4 p-2 rounded-lg w-fit">
                        Note: Events are available for feedback for 48 hours after they end
                      </p>
                    </motion.div>
                    <EventList onEventSelect={handleEventSelect} />
                  </div>
                </>

              )}
            </section>

            <FeatureHighlights />
            <CallToAction />
          </main>
        </div>

        {/* Subtle footer */}
        <div className="relative z-10 py-6 text-center text-sm text-foreground/60">
          <p>
            © {new Date().getFullYear()} Build Fast With AI. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
