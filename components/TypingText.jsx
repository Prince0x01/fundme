import { motion } from "framer-motion";

import { textContainer, textVariant2 } from "@/utils/motion";

const TypingText = ({ title, textStyles }) => {
    return (
        <motion.p
          variants={textContainer}
          className={`${textStyles}`}
        >
          {Array.from(title).map((letter, index) => (
            <motion.span variants={textVariant2} key={index}>
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.p>
      )
};

export default TypingText;
