"use client"

import { useState, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Protect, PricingTable, UserButton } from '@clerk/nextjs';

function RecipeForm() {
    const { getToken } = useAuth();

    const [dishName, setDishName] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState('None');
    const [cookingSkillLevel, setCookingSkillLevel] = useState('Beginner');
    const [availableTimeMinutes, setAvailableTimeMinutes] = useState('30');
    const [healthGoal, setHealthGoal] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setOutput('');
        setLoading(true);

        const jwt = await getToken();
        if (!jwt) {
            setOutput('Authentication required');
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let buffer = '';

        await fetchEventSource(process.env.NEXT_PUBLIC_API_URL || '/api', {
            signal: controller.signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                dish_name: dishName,
                dietary_restrictions: dietaryRestrictions,
                cooking_skill_level: cookingSkillLevel,
                available_time_minutes: availableTimeMinutes,
                health_goal: healthGoal,
            }),
            onmessage(ev) {
                if (ev.data === '  ') {
                    buffer += '\n';
                } else {
                    buffer += ev.data;
                }
                setOutput(buffer);
            },
            onclose() {
                setLoading(false);
            },
            onerror(err) {
                console.error('SSE error:', err);
                controller.abort();
                setLoading(false);
            },
        });
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
                🍳 Recipe & Nutrition Coach
            </h1>
            <p className="text-gray-400 mb-8">
                Tell Chef Nova what you want to cook and get a personalized recipe, nutrition breakdown, and pro tips instantly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">

                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-300">
                        Dish or Meal Type
                    </label>
                    <input
                        type="text"
                        required
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        placeholder="e.g. Pasta, Chicken Stir Fry, Smoothie Bowl"
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-500"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-300">
                        Dietary Restrictions
                    </label>
                    <select
                        required
                        value={dietaryRestrictions}
                        onChange={(e) => setDietaryRestrictions(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    >
                        <option value="None">None</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Gluten-Free">Gluten-Free</option>
                        <option value="Dairy-Free">Dairy-Free</option>
                        <option value="Nut-Free">Nut-Free</option>
                        <option value="Halal">Halal</option>
                        <option value="Keto">Keto</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-300">
                        Cooking Skill Level
                    </label>
                    <select
                        required
                        value={cookingSkillLevel}
                        onChange={(e) => setCookingSkillLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-300">
                        Available Time (minutes)
                    </label>
                    <select
                        required
                        value={availableTimeMinutes}
                        onChange={(e) => setAvailableTimeMinutes(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90+ minutes</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-300">
                        Health Goal
                    </label>
                    <input
                        type="text"
                        required
                        value={healthGoal}
                        onChange={(e) => setHealthGoal(e.target.value)}
                        placeholder="e.g. Lose weight, Build muscle, Eat more protein"
                        className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    {loading ? '👨‍🍳 Chef Nova is cooking...' : '🍽️ Get My Recipe'}
                </button>
            </form>

            {output && (
                <section className="mt-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4">
                        <h2 className="text-xl font-bold text-white">🌿 Your Personalized Recipe Guide</h2>
                    </div>
                    <div className="p-8 prose prose-invert max-w-none
                        prose-h2:text-green-400 prose-h2:font-bold prose-h2:text-xl
                        prose-h2:border-b prose-h2:border-gray-600 prose-h2:pb-2 prose-h2:mt-8
                        prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-li:text-gray-300
                        prose-strong:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {output}
                        </ReactMarkdown>
                    </div>
                </section>
            )}
        </div>
    );
}

export default function Product() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="absolute top-4 right-4">
                <UserButton showName={true} />
            </div>
            <Protect
                plan="premium_subscription"
                fallback={
                    <div className="container mx-auto px-4 py-12">
                        <header className="text-center mb-12">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-4">
                                🍳 Chef Nova Pro
                            </h1>
                            <p className="text-gray-400 text-lg mb-8">
                                Subscribe to access your AI-powered personal recipe and nutrition coach
                            </p>
                        </header>
                        <div className="max-w-4xl mx-auto">
                            <PricingTable />
                        </div>
                    </div>
                }
            >
                <RecipeForm />
            </Protect>
        </main>
    );
}