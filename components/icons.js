import {
  Menu, Sparkles, Heading, Pilcrow, MousePointerClick, Quote, Minus, MoveVertical, Image, LayoutGrid, Youtube,
  Building2, User, Gauge, Briefcase, GraduationCap, BarChart3, FileDown, FolderKanban, Layers, MessageSquareQuote,
  BadgeIndianRupee, HelpCircle, Megaphone, Link, Share2, Mail, MapPin, Code2, PanelBottom, Square,
  Orbit, Cpu, Rocket, BookOpen, Workflow, Waypoints, Github, Trophy, GitPullRequest, Award, Newspaper, Lightbulb,
  Terminal, Braces, Webhook, Radio, MonitorPlay, Activity, Bot,
  ListOrdered, ArrowLeftRight, PanelsTopLeft, Type, MailPlus, CalendarCheck, Frame, LayoutPanelLeft, Users, TextQuote, FileText,
} from 'lucide-react';

const MAP = {
  Menu, Sparkles, Heading, Pilcrow, MousePointerClick, Quote, Minus, MoveVertical, Image, LayoutGrid, Youtube,
  Building2, User, Gauge, Briefcase, GraduationCap, BarChart3, FileDown, FolderKanban, Layers, MessageSquareQuote,
  BadgeIndianRupee, HelpCircle, Megaphone, Link, Share2, Mail, MapPin, Code2, PanelBottom,
  Orbit, Cpu, Rocket, BookOpen, Workflow, Waypoints, Github, Trophy, GitPullRequest, Award, Newspaper, Lightbulb,
  Terminal, Braces, Webhook, Radio, MonitorPlay, Activity, Bot,
  ListOrdered, ArrowLeftRight, PanelsTopLeft, Type, MailPlus, CalendarCheck, Frame, LayoutPanelLeft, Users, TextQuote, FileText,
};

export function BlockIcon({ name, ...props }) {
  const C = MAP[name] || Square;
  return <C {...props} />;
}
