import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarInitials } from "@/lib/auth/avatar";
import { cn } from "@/lib/shared/utils";

export function MemberAvatar({
  name,
  className,
  fallbackClassName,
  label,
  decorative = false,
}: {
  name: string;
  className?: string;
  fallbackClassName?: string;
  label?: string;
  decorative?: boolean;
}) {
  return (
    <Avatar
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : (label ?? name)}
      className={className}
    >
      <AvatarFallback
        className={cn(
          "bg-primary font-serif text-[10px] text-white",
          fallbackClassName,
        )}
      >
        {avatarInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
