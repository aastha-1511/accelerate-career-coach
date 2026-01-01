import HeroSection from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card"
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { testimonial } from "@/data/testimonial";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqs } from "@/data/faq";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div>
      <div className="grid-background"></div>

      <HeroSection />

      {/* Features Section - Enhanced with hover effects */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-white bg-clip-text text-transparent">
              Powerful Features for Your Career Growth
            </h2>
            <p className="text-muted-foreground">Everything you need to succeed in your career journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-2 group bg-gradient-to-b from-background to-background/50"
              >
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced with animated counters effect */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { number: "50+", label: "Industries Covered" },
              { number: "1000+", label: "Interview Questions" },
              { number: "95%", label: "Success Rate" },
              { number: "24/7", label: "AI Support" }
            ].map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center space-y-2 p-6 rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:scale-105"
              >
                <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced with step indicators */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-white bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">Four simple steps to accelerate your career growth</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            {howItWorks.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-4 relative group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 relative z-10">
                  <div className="text-white">{item.icon}</div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced with better cards */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-white bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-center text-muted-foreground mb-12">Join thousands of satisfied professionals</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonial.map((testimonial, index) => (
              <Card key={index} className="bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-4">
                    {/* Star rating */}
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <blockquote className="relative pl-6">
                        <span className="absolute -left-1 -top-2 text-4xl text-primary opacity-20">
                          “
                        </span>
                        <p className="text-muted-foreground italic">
                          {testimonial.quote}
                        </p>
                      </blockquote>
                    
                    <div className="flex items-center space-x-4 pt-4 border-t">
                      <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.author}
                            fill
                            className="rounded-full object-cover border-2 border-primary/20"
                          />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Enhanced accordion */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-white bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">Find answers to common questions about our platform</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with gradient and animation */}
      <section className="w-full px-4 pb-12">
        <div className="mx-auto py-24 bg-gradient-to-br from-primary via-purple-600 to-primary rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[600px] text-white/90 md:text-xl leading-relaxed">
              Join thousands of professionals who are advancing their careers with AI-powered guidance.
            </p>
            <Link href="/dashboard" passHref>
              <Button 
                size="lg" 
                variant="secondary" 
                className="h-12 px-8 mt-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg group"
              >
                Start Your Journey Today 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
