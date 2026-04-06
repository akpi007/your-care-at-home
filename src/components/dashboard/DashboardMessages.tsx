import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Loader2 } from "lucide-react";
import BookingChat from "@/components/BookingChat";

interface Conversation {
  bookingId: string;
  professionalName: string;
  professionalImage: string;
  lastMessage: string;
  lastMessageAt: string;
  bookingStatus: string;
}

const DashboardMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      // Get all bookings with messages
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, status, professionals(display_name, image_url)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!bookings || bookings.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get last message per booking
      const convos: Conversation[] = [];
      for (const b of bookings) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("message, created_at")
          .eq("booking_id", b.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (msgs && msgs.length > 0) {
          const pro = b.professionals as any;
          convos.push({
            bookingId: b.id,
            professionalName: pro?.display_name || "Professional",
            professionalImage: pro?.image_url || "/placeholder.svg",
            lastMessage: msgs[0].message,
            lastMessageAt: msgs[0].created_at,
            bookingStatus: b.status,
          });
        }
      }

      setConversations(convos);
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Messages</h3>

      {conversations.length === 0 ? (
        <div className="rounded-xl bg-card p-8 text-center shadow-card">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h4 className="font-display font-semibold text-foreground">No messages yet</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Your conversations with healthcare providers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(convo => (
            <button
              key={convo.bookingId}
              onClick={() => setActiveChat(convo.bookingId)}
              className="w-full flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all text-left"
            >
              <img
                src={convo.professionalImage}
                alt={convo.professionalName}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-card-foreground truncate">{convo.professionalName}</h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(convo.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <BookingChat
        bookingId={activeChat ?? ""}
        open={!!activeChat}
        onClose={() => setActiveChat(null)}
      />
    </div>
  );
};

export default DashboardMessages;
