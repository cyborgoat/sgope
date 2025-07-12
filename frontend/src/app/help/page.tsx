"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  ChevronDown, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Settings,
  Book,
  Video,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do I add a new LLM service?",
    answer: "Go to the Dashboard and click on the LLM Services card, then click 'Configure Services'. You can add Ollama or OpenAI-compatible services by providing the required connection details.",
    category: "LLM Services"
  },
  {
    question: "How do I upload files to the knowledge base?",
    answer: "You can upload files through the chat interface by using the attachment button, or manage them through the Knowledge Base card on the dashboard.",
    category: "Knowledge Base"
  },
  {
    question: "Can I sync my tasks across devices?",
    answer: "Currently, tasks are stored locally in your browser. We're working on cloud sync functionality for future releases.",
    category: "Tasks"
  },
  {
    question: "How do I change the default model?",
    answer: "In the model selector dropdown (top of chat interface), click the star icon next to any model to set it as default.",
    category: "LLM Services"
  },
  {
    question: "What file formats are supported for knowledge base?",
    answer: "We support text files (.txt, .md, .json), documents (.pdf, .docx), and images. Files are processed and made searchable for AI interactions.",
    category: "Knowledge Base"
  },
  {
    question: "How do I backup my data?",
    answer: "Go to Settings > Data Management and use the 'Export All Data' button to download a backup of your tasks, knowledge base, and settings.",
    category: "Data Management"
  }
];

const guides = [
  {
    title: "Getting Started with Sgope",
    description: "Learn the basics of setting up and using Sgope for the first time",
    icon: <Book className="h-5 w-5" />,
    steps: [
      "Configure your first LLM service (Ollama or OpenAI)",
      "Upload some documents to your knowledge base",
      "Start your first chat conversation",
      "Create your first task in the todo list"
    ]
  },
  {
    title: "Advanced Chat Features",
    description: "Discover powerful features for enhanced AI conversations",
    icon: <MessageSquare className="h-5 w-5" />,
    steps: [
      "Use file attachments in conversations",
      "Execute actions during chat",
      "Reference knowledge base content",
      "Switch between different models"
    ]
  },
  {
    title: "Knowledge Management",
    description: "Organize and manage your documents effectively",
    icon: <FileText className="h-5 w-5" />,
    steps: [
      "Upload and organize files",
      "Search through your knowledge base",
      "Reference files in conversations",
      "Manage file permissions and access"
    ]
  },
  {
    title: "Task Management",
    description: "Stay organized with the built-in todo system",
    icon: <CheckSquare className="h-5 w-5" />,
    steps: [
      "Create and categorize tasks",
      "Set priorities and due dates",
      "Track completion progress",
      "Use tags for better organization"
    ]
  }
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
          <p className="text-muted-foreground">
            Find answers to common questions and learn how to use Sgope effectively
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Chat Guide</p>
                <p className="text-sm text-muted-foreground">Learn chat features</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Setup Guide</p>
                <p className="text-sm text-muted-foreground">Configuration help</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Video Tutorials</p>
                <p className="text-sm text-muted-foreground">Watch and learn</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Documentation</p>
                <p className="text-sm text-muted-foreground">Full reference</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Getting Started Guides */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Getting Started</h3>
          {guides.map((guide, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {guide.icon}
                  {guide.title}
                </CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
          {Object.entries(groupedFaqs).map(([category, questions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((faq, index) => (
                    <Collapsible 
                      key={index}
                      open={openItems.includes(`${category}-${index}`)}
                      onOpenChange={() => toggleItem(`${category}-${index}`)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                        >
                          <span className="text-left font-medium">{faq.question}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            openItems.includes(`${category}-${index}`) ? 'rotate-180' : ''
                          }`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Need More Help?
          </CardTitle>
          <CardDescription>
            Can't find what you're looking for? Get in touch with our support team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <MessageSquare className="h-5 w-5 mx-auto mb-2" />
                <p className="font-medium">Live Chat</p>
                <p className="text-xs text-muted-foreground">Get instant help</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <ExternalLink className="h-5 w-5 mx-auto mb-2" />
                <p className="font-medium">GitHub Issues</p>
                <p className="text-xs text-muted-foreground">Report bugs</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Book className="h-5 w-5 mx-auto mb-2" />
                <p className="font-medium">Documentation</p>
                <p className="text-xs text-muted-foreground">Full reference</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Sgope Version</p>
              <p className="text-sm text-muted-foreground">v1.0.0-beta</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">January 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
