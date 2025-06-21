import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChatPage = () => {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [message, setMessage] = useState('');
    const queryClient = useQueryClient();

    // Fetch chat list
    const { data: chats, isLoading } = useQuery({
        queryKey: ['chats'],
        queryFn: () => chatAPI.get('/chat'),
    });

    // Fetch messages for selected chat
    const { data: messages, isLoading: loadingMessages } = useQuery({
        queryKey: ['chat-messages', selectedChatId],
        queryFn: () => selectedChatId ? chatAPI.get(`/chat/${selectedChatId}`) : [],
        enabled: !!selectedChatId,
    });

    // Send message mutation
    const sendMutation = useMutation({
        mutationFn: (msg) => chatAPI.post(`/chat/${selectedChatId}/send`, { message: msg }),
        onSuccess: () => {
            queryClient.invalidateQueries(['chat-messages', selectedChatId]);
            setMessage('');
        },
    });

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[60vh]">
            {/* Chat List */}
            <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-4">Chats</h2>
                {isLoading ? <LoadingSpinner /> : (
                    <ul className="space-y-2">
                        {chats && chats.length > 0 ? chats.map((chat) => (
                            <li
                                key={chat._id}
                                className={`p-2 rounded cursor-pointer ${selectedChatId === chat._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                onClick={() => setSelectedChatId(chat._id)}
                            >
                                <div className="font-medium text-gray-900">{chat.otherUserName}</div>
                                <div className="text-xs text-gray-500">{chat.lastMessage?.slice(0, 40)}</div>
                            </li>
                        )) : <li className="text-gray-500">No chats yet.</li>}
                    </ul>
                )}
            </div>
            {/* Chat Window */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
                {selectedChatId ? (
                    <>
                        <div className="flex-1 overflow-y-auto mb-4">
                            {loadingMessages ? <LoadingSpinner /> : (
                                <ul className="space-y-2">
                                    {messages && messages.length > 0 ? messages.map((msg) => (
                                        <li key={msg._id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`px-3 py-2 rounded-lg ${msg.isMine ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                                {msg.text}
                                                <div className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        </li>
                                    )) : <li className="text-gray-500">No messages yet.</li>}
                                </ul>
                            )}
                        </div>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                if (message.trim()) sendMutation.mutate(message);
                            }}
                            className="flex items-center space-x-2"
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                                placeholder="Type your message..."
                                disabled={sendMutation.isLoading}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                                disabled={sendMutation.isLoading || !message.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging.</div>
                )}
            </div>
        </div>
    );
};

export default ChatPage; 