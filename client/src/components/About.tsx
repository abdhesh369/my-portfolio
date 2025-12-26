import { motion } from "framer-motion";
import { useSkills } from "@/hooks/use-portfolio";
import { Code, Server, Cpu, Layers, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import profileImg from "@assets/images/Myphoto.jpg";

export default function About() {
  const { data: skills, isLoading } = useSkills();

  const scrollToHero = () => {
    const element = document.getElementById('hero');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  return (
    <section id="about" className="section-container bg-muted/30">
      <div className="text-center mb-16 relative">
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 top-0 rounded-full hover-elevate"
          onClick={scrollToHero}
          aria-label="Back to top"
        >
          <Home className="w-4 h-4" />
        </Button>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">About Me</h2>
        <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          <div className="relative w-full max-w-sm mx-auto group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/10 shadow-xl bg-card">
              <img 
                src={profileImg} 
                alt="Abdhesh" 
                className="w-full h-auto object-cover aspect-[4/5]"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Engineering Student & Developer</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I am Abdhesh, an Electronics & Communication Engineering student at Tribhuvan University with a deep passion for computing systems. My academic background gives me a unique perspective on the intersection of hardware and software.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              While I study engineering principles by day, I spend my nights building practical software solutions. I focus on clean architecture, performance optimization, and creating intuitive user experiences.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-card rounded-xl border border-border">
                <Code className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold">Frontend</h4>
                <p className="text-sm text-muted-foreground">React, TypeScript, Tailwind</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border">
                <Server className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold">Backend</h4>
                <p className="text-sm text-muted-foreground">Node.js, PostgreSQL, Go</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div id="skills" className="space-y-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-2">Skills</h3>
            <div className="h-1.5 w-16 bg-primary mx-auto rounded-full mb-12" />
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
                <motion.div 
                  key={skill.id} 
                  variants={item} 
                  className="group relative bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {/* Dynamically render Lucide icons or fallback */}
                      <Code className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-lg">{skill.name}</h4>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {skill.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
