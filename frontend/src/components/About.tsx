import { motion } from "framer-motion";
import profileImg from "../../../attached_assets/images/Myphoto.jpg";

export default function About() {
  return (
    <section id="about" className="section-container bg-muted/30 scroll-mt-20">
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">About Me</h2>
        <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}