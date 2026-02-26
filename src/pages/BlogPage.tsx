
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  const posts = [
    {
      id: 1,
      title: "The Ultimate Guide to Finding Your Personal Color",
      description: "Learn the secrets behind color analysis and how it can transform your style.",
      date: "May 20, 2024",
    },
    {
      id: 2,
      title: "Top 5 Lipsticks for a 'Spring Bright' Tone",
      description: "Discover our curated list of must-have lipsticks that will make you shine.",
      date: "May 18, 2024",
    },
    {
        id: 3,
        title: "How to Build a Capsule Wardrobe with Your Color Palette",
        description: "Simplify your life and elevate your style by building a wardrobe that truly works for you.",
        date: "May 15, 2024",
    },
  ];
  
  const BlogPage = () => {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">From the Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Insights, tips, and stories on color, style, and confidence.
            </p>
        </div>
  
        <div className="mt-12 grid gap-8">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
                    <CardDescription>{post.date}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{post.description}</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  export default BlogPage;
  