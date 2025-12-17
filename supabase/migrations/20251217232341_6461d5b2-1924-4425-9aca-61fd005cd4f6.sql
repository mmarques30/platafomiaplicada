-- Criar trigger de auditoria para materiais_gratuitos
CREATE TRIGGER trigger_auditoria_materiais_gratuitos
  AFTER INSERT OR UPDATE OR DELETE ON materiais_gratuitos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_auditoria();