# 🎨 Color → Buy Coach: Project Blueprint

## 🚀 Project Overview & Vision

'Color → Buy Coach' is an automated monetization engine designed to bridge the gap between AI-driven personal color analysis and e-commerce. Our vision is to create a seamless user journey from "discovery" (finding one's personal color) to "action" (purchasing recommended products), generating revenue through affiliate marketing and advertising.

## 🎯 Core Objectives & Monetization Strategy

1.  **Conversion Revenue (Coupang Partners)**: Recommend 3 relevant products from our Supabase DB based on the user's AI-diagnosed color tone. Earn a commission for every purchase made through our affiliate links.
2.  **Traffic Revenue (Google AdSense)**: Monetize the website's traffic by strategically placing AdSense banners, capitalizing on the viral nature of personal color analysis.
3.  **Scale & Exit**: Achieve a stable Product-Market Fit (PMF) with a 20-30% retention rate, paving the way for global expansion (U.S. entity, Stripe integration) or a strategic exit via platforms like MicroAcquire.

## 🗺️ Execution Roadmap

### Phase 1: MVP UX Enhancement (Near Completion)
- **Objective**: Refine the user flow to ensure a smooth path from photo upload to purchase.
- **Key Tasks**:
    - Implement a "Labor Illusion" loading screen to enhance perceived value during AI analysis.
    - Finalize and test the data connection to Supabase, ensuring 3 accurate product recommendations are always displayed.

### Phase 2: Monetization Setup (Current Focus)
- **Objective**: Establish the core revenue pipelines.
- **Key Tasks**:
    - **[Current]** Add 'About Us' and 'Privacy Policy' pages to meet Google AdSense approval criteria.
    - Integrate actual Coupang Partners affiliate links for all product recommendations.
    - Submit the live site for Google AdSense review.

### Phase 3: Viral Loop Activation
- **Objective**: Engineer organic growth by empowering users to share their results.
- **Key Tasks**:
    - Create "Share via KakaoTalk/WhatsApp" functionality with pre-populated, engaging text.
    - Optimize Open Graph (OGP) meta tags for attractive link previews.

### Phase 4: Data-Driven Optimization
- **Objective**: Analyze user behavior to identify and eliminate friction points.
- **Key Tasks**:
    - Integrate Google Analytics 4 (GA4) and Microsoft Clarity for funnel analysis.
    - Track and improve key metrics like the Click-Through Rate (CTR) on product recommendations.

### Phase 5: Growth & Scale-Up
- **Objective**: Achieve exponential growth once the profitability model is proven.
- **Key Tasks**:
    - Promote the service on relevant online communities (e.g., beauty forums, social media).
    - Launch targeted performance marketing campaigns (e.g., Meta/Instagram Ads) to scale user acquisition profitably.

## ✅ Current Action Plan: AdSense Readiness

- **Goal**: Prepare the application for a successful Google AdSense review.
- **Steps**:
    1. Create a new `pages` directory inside `src`.
    2. Create `AboutPage.tsx` and `PrivacyPolicyPage.tsx` components.
    3. Implement routing using `react-router-dom`.
    4. Add links to these new pages in the application footer.
