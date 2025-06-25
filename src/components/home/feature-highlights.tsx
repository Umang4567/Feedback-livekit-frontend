import { motion } from "framer-motion";
import { Bot, Brain, Rocket, Users } from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      icon: Brain,
      title: "Practical Learning",
      description:
        "Gain hands-on experience with real-world projects guided by industry experts",
      color: "from-primary via-primary/80 to-accent",
      delay: 0.1,
      hoverColor:
        "group-hover:from-primary group-hover:via-primary/90 group-hover:to-accent",
    },
    {
      icon: Bot,
      title: "Cutting-Edge Tools",
      description:
        "Access to premium AI models and development tools through BuildFast Studio",
      color: "from-primary via-primary/80 to-accent",
      delay: 0.1,
      hoverColor:
        "group-hover:from-primary group-hover:via-primary/90 group-hover:to-accent",
    },
    {
      icon: Users,
      title: "Community Learning",
      description:
        "Join a vibrant community of AI enthusiasts and learn through collaboration",
      color: "from-primary via-primary/80 to-accent",
      delay: 0.1,
      hoverColor:
        "group-hover:from-primary group-hover:via-primary/90 group-hover:to-accent",
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description:
        "Build a portfolio of AI projects and accelerate your career in tech",
      color: "from-primary via-primary/80 to-accent",
      delay: 0.1,
      hoverColor:
        "group-hover:from-primary group-hover:via-primary/90 group-hover:to-accent",
    },
  ];

  return (
    <div className="w-full py-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3 relative inline-block">
          Why Choose{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-foreground/80 to-accent-foreground">
            Build Fast with AI
          </span>
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/80 to-primary/0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          />
        </h2>
        <p className="text-foreground/70 max-w-2xl mx-auto mt-4">
          Accelerate your AI journey with expert-led training and cutting-edge
          tools
        </p>
      </motion.div>

      {/* Restore ambient glows for better visibility */}
      <div className="relative">
        <div className="absolute left-1/4 top-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute right-1/4 bottom-1/3 w-64 h-64 bg-accent/8 rounded-full blur-[100px] -z-10"></div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              className="transform transition-all duration-500 hover:z-10"
            >
              <div className="relative h-full group">
                {/* Floating particles */}
                <motion.div
                  className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white/20"
                  animate={{
                    y: [0, 10, 0],
                    opacity: [0, 1, 0],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />

                {/* Background blur effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 dark:from-white/5 dark:to-white/0 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Card */}
                <div className="relative h-full backdrop-blur-sm bg-card/30 border border-white/20 p-7 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group-hover:translate-y-[-5px] group-hover:border-white/30 group-hover:bg-card/40">
                  {/* Colorful gradient corner accent */}
                  <div
                    className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${feature.color} ${feature.hoverColor} rounded-full opacity-25 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110`}
                  ></div>

                  <div className="flex items-start gap-5">
                    {/* Icon container with gradient */}
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} ${feature.hoverColor} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 relative overflow-hidden`}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <feature.icon className="w-6 h-6 text-white relative z-10" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-500">
                        {feature.title}
                      </h3>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
