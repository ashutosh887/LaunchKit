"use client";

import { useState } from "react";
import config from "@/config";

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const features = config.home.features.items;
  const benefits = config.home.features.benefits;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">{config.home.features.heading}</h2>
        <p className="text-muted-foreground">{config.home.features.subheading}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 order-2 lg:order-1 flex flex-col">
          <div className="space-y-0.5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isSelected = idx === selectedFeature;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFeature(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? "bg-muted/50 font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${isSelected ? "font-semibold" : "font-normal"}`}>{feature.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="p-5 sm:p-6 rounded-lg bg-muted/30 h-full flex items-center">
            <div className="space-y-2 w-full">
              <h3 className="text-xl sm:text-2xl font-bold">
                {features[selectedFeature].title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {features[selectedFeature].detailedDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 sm:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="space-y-3 text-center">
                <div className="flex justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
