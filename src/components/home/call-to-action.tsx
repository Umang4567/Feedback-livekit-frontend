import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <div className="w-full max-w-5xl mx-auto overflow-hidden">
      <div className="relative">
        {/* Content container */}
        <div className="relative z-10 bg-background dark:bg-background/70 backdrop-blur-sm p-3 md:p-10 rounded-3xl border border-white/10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-10 items-center"
          >
            {/* Left content */}
            <div className="flex-1 text-center md:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Ready to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-foreground to-primary">
                  Transform
                </span>{" "}
                Your AI Journey?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-foreground/70 mb-8 max-w-lg text-lg"
              >
                Join the waitlist to get a limited-time discount—only for the
                next 10 learners!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary/70 to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-lg hover:shadow-accent/20 transition-all duration-300 transform hover:translate-y-[-2px] rounded-full px-8"
                >
                  <a
                    href="https://www.buildfastwithai.com/genai-course"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <span>Join Waitlist</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-foreground hover:bg-white/5 hover:border-white/30 transition-all duration-300 transform hover:translate-y-[-2px] rounded-full px-8"
                >
                  <a
                    href="https://www.buildfastwithai.com/genai-course"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Curriculum
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* Right content - Price card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent/30 blur-sm"></div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-primary/30 blur-md"></div>

              {/* Price tag label */}
              <div className="absolute -top-4 -right-2 z-20 bg-gradient-to-r from-primary/70 to-primary text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg transform rotate-3">
                Limited Time Offer
              </div>

              {/* Card */}
              <motion.div
                whileHover={{ translateY: -10, rotateZ: 0 }}
                className="w-full max-w-4xl bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl rotate-2 transform transition-all duration-500 hover:shadow-accent/10"
              >
                <div className="font-bold text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-foreground to-primary">
                  GenAI Launchpad
                </div>
                <p className="text-sm text-foreground mb-4">
                  Next cohort: <span className="text-primary font-bold">July 5th</span>
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    "Master cutting-edge AI tools & frameworks",
                    "6 weeks of hands-on, project-based learning",
                    "Weekly live mentorship sessions",
                    "100+ tutorials & 30+ templates",
                    "No coding experience required"
                  ].map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary/50 to-primary/60 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-accent"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between gap-4">
                  <Button
                    className="w-1/2 bg-muted border border-border hover:bg-muted/70 text-foreground rounded-full"
                  >
                    <a
                      href="https://www.buildfastwithai.com/genai-course"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Waitlist
                    </a>
                  </Button>
                  <Button
                    className="w-1/2 bg-gradient-to-r from-primary/70 to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-lg transition-all duration-300 rounded-full"
                  >
                    <a
                      href="https://www.buildfastwithai.com/genai-course"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Curriculum
                    </a>
                  </Button>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
