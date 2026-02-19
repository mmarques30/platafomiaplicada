
-- Trigger de auditoria para ia_copie_use
CREATE TRIGGER auditoria_ia_copie_use
AFTER INSERT OR UPDATE OR DELETE ON public.ia_copie_use
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Trigger de auditoria para ferramentas_ia
CREATE TRIGGER auditoria_ferramentas_ia
AFTER INSERT OR UPDATE OR DELETE ON public.ferramentas_ia
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Trigger de auditoria para biblioteca_prompts
CREATE TRIGGER auditoria_biblioteca_prompts
AFTER INSERT OR UPDATE OR DELETE ON public.biblioteca_prompts
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- Trigger de auditoria para metodos_aplicar
CREATE TRIGGER auditoria_metodos_aplicar
AFTER INSERT OR UPDATE OR DELETE ON public.metodos_aplicar
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();
