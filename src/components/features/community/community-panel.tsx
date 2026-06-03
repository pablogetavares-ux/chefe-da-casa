"use client";

import { useMemo, useState } from "react";
import { Heart, MessageCircle, Search, Users } from "lucide-react";

import {
  communityPosts,
  communityTags,
  type CommunityPost,
} from "@/config/community-mock";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AnimatedPage,
  FadeIn,
  StaggerItem,
  StaggerList,
} from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PostCard({
  post,
  liked,
  onLike,
}: {
  post: CommunityPost;
  liked: boolean;
  onLike: () => void;
}) {
  return (
    <article className="surface-card flex flex-col gap-4 p-5 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {post.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{post.author}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium">{post.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            #{tag}
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-4 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", liked && "text-rose-500")}
          onClick={onLike}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
          {post.likes + (liked ? 1 : 0)}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <MessageCircle className="size-4" />
          {post.comments}
        </Button>
      </div>
    </article>
  );
}

export function CommunityPanel() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Todos");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return communityPosts.filter((post) => {
      const matchesTag = tag === "Todos" || post.tags.some((t) => t === tag);
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchesTag && matchesQuery;
    });
  }, [query, tag]);

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Comunidade"
        description="Inspire-se com receitas de outros chefs. Em breve: publicar suas próprias criações."
      />

      <FadeIn>
        <div className="surface-card flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Users className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Feed demonstrativo com conteúdo curado. A funcionalidade de
            publicação e comentários será conectada ao backend em breve.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar receitas da comunidade..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {communityTags.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tag === t ? "default" : "outline"}
                onClick={() => setTag(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </FadeIn>

      <StaggerList className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="md:col-span-2">
            <EmptyState
              icon={Search}
              title="Nenhum resultado"
              description="Tente outro termo ou remova o filtro de tag."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setTag("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          </div>
        ) : (
          filtered.map((post) => (
            <StaggerItem key={post.id}>
              <PostCard
                post={post}
                liked={likedIds.has(post.id)}
                onLike={() => toggleLike(post.id)}
              />
            </StaggerItem>
          ))
        )}
      </StaggerList>
    </AnimatedPage>
  );
}
