"use client";

import ShaderBackground from "@/components/ui/shader-background";

export const DemoOne = () => {
    return (
        <div className="relative w-full h-screen">
            <ShaderBackground />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h1 className="text-4xl font-bold text-white z-10">Shader Background Demo</h1>
            </div>
        </div>
    );
};
