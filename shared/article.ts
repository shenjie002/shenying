import {z} from 'zod';

export const articleRequestSchema = z.object({
  article: z.string().trim().min(80, '文章至少需要 80 个字符').max(30000, '文章最多 30000 个字符'),
  audience: z.enum(['beginner', 'general', 'technical']).default('general'),
  style: z.enum(['clear', 'story', 'professional']).default('clear'),
  duration: z.number().int().min(30).max(600).default(90),
  sceneCount: z.number().int().min(3).max(12).default(5),
});
export type ArticleRequest = z.infer<typeof articleRequestSchema>;
export const templateLabels: Record<string, string> = {TitleSlide: '标题封面', BulletListSlide: '要点列表', CodeSlide: '代码讲解', CardSlide: '双栏对比', FlowSlide: '流程演示', TerminalSlide: '终端演示'};
