import { motion } from 'framer-motion';

export function NoAgentNotification() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-white"
        >
            <p className="text-sm font-fira">
                The feedback agent is not connected. Please try refreshing the page or contact support if the
                issue persists.
            </p>
        </motion.div>
    );
} 