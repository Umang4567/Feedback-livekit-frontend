import { useState } from "react";
import { useAtom } from "jotai";
import { userDetailsAtom, selectedEventAtom } from "@/lib/atoms";
import { format } from "date-fns";
import { FallbackImage } from "./ui/fallback-image";

const UserDetailsForm = ({ onSubmit }: { onSubmit: () => void }) => {
  const [userDetails, setUserDetails] = useAtom(userDetailsAtom);
  const [selectedEvent] = useAtom(selectedEventAtom);
  const [formData, setFormData] = useState({
    name: userDetails?.name || "",
    email: userDetails?.email || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserDetails(formData);
    onSubmit();
  };

  if (!selectedEvent) {
    return (
      <div className="w-full glassmorphism rounded-xl shadow-xl p-6">
        <div className="text-center text-destructive">
          <p>No event selected. Please go back and select an event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground/90 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-3 bg-secondary/30 border border-border/60 text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground/90 mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 bg-secondary/30 border border-border/60 text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all"
            placeholder="john.doe@example.com"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 transition-all shadow-lg font-medium relative overflow-hidden group"
        >
          <span className="relative z-10">Start Feedback Session</span>
          <span className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        </button>
      </form>
    </div>
  );
};

export default UserDetailsForm;
