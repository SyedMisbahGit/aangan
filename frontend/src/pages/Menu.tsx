import React, { useState } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader, isUserFacingRoute } from '../components/shared/DreamHeader';
import { Card, CardContent } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { motion } from 'framer-motion';
import { 
  Info, 
  Settings, 
  Star,
  ArrowRight,
  Moon,
  BookOpen,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import NotificationFeed from '../components/notifications/NotificationFeed';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";

const MyCorner: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  const location = useLocation();

  const cornerItems = [
    {
      title: 'Diary',
      description: 'Your private thoughts and reflections',
      icon: BookOpen,
      href: '/diary',
    },
    {
      title: 'Settings',
      description: 'Customize your Aangan experience',
      icon: Settings,
      href: '/settings',
    },
    {
      title: 'About',
      description: 'Learn about our mission and values',
      icon: Info,
      href: '/about',
    },
    {
      title: 'Stats',
      description: 'Your journey through the courtyard',
      icon: Star,
      href: '/stats',
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <>
      <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in your corner.">
        <DreamLayout>
          <div className="bg-aangan-ground min-h-screen">
            {isUserFacingRoute(location.pathname) && (
              <DreamHeader
                title="My Corner"
                subtitle="A quiet space for reflection and self-care."
              />
            )}
            <main
              role="main"
              aria-labelledby="page-title"
              tabIndex={-1}
              ref={mainRef}
              className="max-w-2xl mx-auto px-4 py-6 space-y-4"
            >
              <h1 id="page-title" className="sr-only">My Corner</h1>
              {/* Notification Feed */}
              <NotificationFeed />

              {/* Corner Items */}
              {cornerItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} variants={cardVariants} initial="hidden" animate="visible" custom={index + 1}>
                    <Link to={item.href}>
                      <Card className="bg-aangan-paper/80 backdrop-blur-lg border border-aangan-dusk hover:border-terracotta-orange/50 transition-colors">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Icon className="w-6 h-6 text-night-blue" />
                            <div>
                              <h3 className="font-serif text-text-poetic">{item.title}</h3>
                              <p className="text-sm text-text-metaphor">{item.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-text-metaphor" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </main>
          </div>
        </DreamLayout>
      </ErrorBoundary>
    </>
  );
};

export default MyCorner;