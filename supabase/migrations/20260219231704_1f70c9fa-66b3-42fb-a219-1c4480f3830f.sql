
-- Trigger de auditoria para conteudos_dashboard (Central de Notícias)
CREATE TRIGGER auditoria_conteudos_dashboard
  AFTER INSERT OR UPDATE OR DELETE ON public.conteudos_dashboard
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Trigger de auditoria para aulas_semanais
CREATE TRIGGER auditoria_aulas_semanais
  AFTER INSERT OR UPDATE OR DELETE ON public.aulas_semanais
  FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();
