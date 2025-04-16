
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const QuickAddNote = ({ onAddNote }) => {
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          text: note.trim(),
          completed: false,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          priority,
          recurring: false
        }])
        .select()
        .single();

      if (error) throw error;

      onAddNote(data);
      setNote("");
      setPriority("normal");
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type a new task..."
        className="flex-1 bg-yellow-50/50 border-yellow-200 focus-visible:ring-yellow-400"
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          size="icon" 
          type="submit" 
          className="bg-yellow-500 hover:bg-yellow-600"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default QuickAddNote;
