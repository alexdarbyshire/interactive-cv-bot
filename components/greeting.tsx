import { motion } from 'framer-motion';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        Welcome to Alex Darbyshire&apos;s Interactive CV
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-zinc-500 max-w-2xl"
      >
        Ask me about Alex&apos;s experience, or let me create a tailored
        &apos;course of life&apos; (<em>curriculum vitae</em>), or we could do a{' '}
        <em>résumé</em> should you prefer the French.
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-sm text-zinc-400"
      >
        <p>
          Learn more about how this tool came about in this post:{' '}
          <a
            href="https://www.alexdarbyshire.com/2025/06/interactive-cv-bot-automating-a-less-than-fun-task/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 underline transition-colors"
          >
            Interactive CV Bot: Automating a Less Than Fun Task
          </a>
        </p>
      </motion.div>
    </div>
  );
};
