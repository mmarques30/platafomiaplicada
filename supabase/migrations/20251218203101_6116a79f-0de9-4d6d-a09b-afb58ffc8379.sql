-- Adicionar política para admins visualizarem todas as mensagens do chat
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));