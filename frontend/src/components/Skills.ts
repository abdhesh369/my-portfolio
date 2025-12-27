import { motion } from "framer-motion";
import { Code } from "lucide-react";
import { useSkills } from "@/hooks/use-portfolio";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Helper component
const SkillCard = ({ skill }: { skill: { id: number; name: string; category: string; } }) => (
  <motion.div 
    variants={item} 
    className="group relative bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
    <div className="flex flex-col items-center text-center gap-3">
      <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        <Code className="w-6 h-6" />
      </div>
      <h4 className="font-semibold text-lg">{skill.name}</h4>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        {skill.category}
      </span>
    </div>
  </motion.div>
);

// Main Component
export default function Skills() {
  const { data: skills, isLoading } = useSkills();

  return (
    <section id="skills" className="section-container scroll-mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Skills</h2>
        <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {skills?.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </motion.div>
      )}
    </section>
  );
}