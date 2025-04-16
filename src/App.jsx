
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import NotesList from "@/components/NotesList";
import RemindersList from "@/components/RemindersList";
import DayContent from "@/components/DayContent";
import WeatherTile from "@/components/WeatherTile";
import Navigation from "@/components/Navigation";
import FocusMode from "@/components/FocusMode";

function App() {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState({});
  const [reminders, setReminders] = useState({});
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState("calendar");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "Please sign in to continue.",
            variant: "destructive"
          });
          return;
        }

        // Fetch user settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (settings) {
          setUserData(settings);
          setShowOnboarding(false);
        }

        // Fetch notes
        const { data: notesData } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id);

        if (notesData) {
          const groupedNotes = notesData.reduce((acc, note) => {
            const dateStr = format(new Date(note.timestamp), 'yyyy-MM-dd');
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(note);
            return acc;
          }, {});
          setNotes(groupedNotes);
        }

        // Fetch reminders
        const { data: remindersData } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id);

        if (remindersData) {
          const groupedReminders = remindersData.reduce((acc, reminder) => {
            const dateStr = format(new Date(reminder.date), 'yyyy-MM-dd');
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(reminder);
            return acc;
          }, {});
          setReminders(groupedReminders);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
      }
    };

    fetchInitialData();
  }, [toast]);

  const saveUserData = async (formData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          name: formData.name,
          goals: formData.goals,
          routine: formData.routine,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUserData(data);
      setShowOnboarding(false);
      
      toast({
        title: "Welcome to your Personal Planner!",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving user data:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (noteText, priority = "normal") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const dateStr = format(date, "yyyy-MM-dd");
      const newNote = {
        text: noteText,
        completed: false,
        user_id: user.id,
        timestamp: new Date().toISOString(),
        priority,
        recurring: false
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), data]
      }));

      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addReminder = async (reminderData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const dateStr = format(date, "yyyy-MM-dd");
      const newReminder = {
        ...reminderData,
        user_id: user.id,
        date: dateStr,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reminders')
        .insert([newReminder])
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), data]
      }));

      toast({
        title: "Success",
        description: "Reminder added successfully",
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleNote = async (noteId, completed) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ completed: !completed })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => {
        const newNotes = { ...prev };
        Object.keys(newNotes).forEach(dateStr => {
          newNotes[dateStr] = newNotes[dateStr].map(note =>
            note.id === noteId ? { ...note, completed: !completed } : note
          );
        });
        return newNotes;
      });

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error('Error toggling note:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderDayContent = (dayDate) => {
    const dateStr = format(dayDate, "yyyy-MM-dd");
    const dayNotes = notes[dateStr] || [];
    const dayReminders = reminders[dateStr] || [];
    
    if (dayNotes.length === 0 && dayReminders.length === 0) return null;

    return (
      <div className="flex gap-1 justify-center mt-1">
        {dayNotes.length > 0 && (
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        )}
        {dayReminders.length > 0 && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <Navigation activeSection={activeSection} onSelectSection={setActiveSection} />
      
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to Your AI Personal Planner</DialogTitle>
            <DialogDescription>
              Let's personalize your experience. Please tell us about yourself.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              saveUserData({
                name: formData.get("name"),
                goals: formData.get("goals"),
                routine: formData.get("routine"),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Input
                name="name"
                placeholder="Your name"
                required
                className="mb-2"
              />
              <Input
                name="goals"
                placeholder="What are your main goals?"
                required
                className="mb-2"
              />
              <Input
                name="routine"
                placeholder="Describe your daily routine"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Start Planning"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {userData && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {userData.name}!
              </h1>
            </div>
          </div>
        )}

        {activeSection === "focus" ? (
          <FocusMode />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <div className="space-y-6">
                <WeatherTile />
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {format(date, "MMMM d, yyyy")}
                  </h2>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border-none"
                          classNames={{
                            day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                            day_today: "bg-blue-100 text-blue-900",
                          }}
                          components={{
                            DayContent: ({ date: dayDate }) => (
                              <div className="w-full h-full">
                                <div className="flex justify-center items-center h-7">
                                  {dayDate.getDate()}
                                </div>
                                {renderDayContent(dayDate)}
                              </div>
                            ),
                          }}
                        />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <DayContent
                        date={date}
                        notes={notes[format(date, "yyyy-MM-dd")] || []}
                        reminders={reminders[format(date, "yyyy-MM-dd")] || []}
                      />
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <NotesList
                notes={notes[format(date, "yyyy-MM-dd")] || []}
                onToggleNote={toggleNote}
                onAddNote={addNote}
              />
            </div>

            <div className="lg:col-span-4">
              <RemindersList
                reminders={reminders[format(date, "yyyy-MM-dd")] || []}
                onAddReminder={addReminder}
              />
            </div>
          </div>
        )}
      </motion.div>
      <Toaster />
    </div>
  );
}

export default App;
