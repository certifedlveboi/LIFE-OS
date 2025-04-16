
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const QuickAddReminder = ({ onAddReminder }) => {
  const [reminder, setReminder] = useState("");
  const [time, setTime] = useState("12:00");
  const [category, setCategory] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reminder.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          text: reminder.trim(),
          time,
          category,
          completed: false,
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      onAddReminder(data);
      setReminder("");
      setTime("12:00");
      setCategory("personal");
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <Input
        value={reminder}
        onChange={(e) => setReminder(e.target.value)}
        placeholder="Add a reminder..."
        className="w-full bg-blue-50/50 border-blue-200 focus-visible:ring-blue-400"
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Select 
          value={category} 
          onValueChange={setCategory}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          size="icon" 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default QuickAddReminder;
