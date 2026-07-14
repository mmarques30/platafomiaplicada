-- Renomeia rótulos de menu para ficarem mais óbvios (decisão de produto).
-- Os itens de "Bibliotecas" e o submenu "Explorar" também são ajustados no
-- código da sidebar; aqui garantimos consistência para os rótulos servidos
-- pelo banco (menu_config) e exibidos no admin "Gerenciar Menus".
-- UPDATE sem correspondência é no-op (seguro).

UPDATE public.menu_config SET label = 'Cursos'            WHERE menu_key = 'aprender';
UPDATE public.menu_config SET label = 'Materiais'         WHERE menu_key = 'bibliotecas';
UPDATE public.menu_config SET label = 'Métodos práticos'  WHERE menu_key = 'metodos_aplicar';
UPDATE public.menu_config SET label = 'Modelos prontos'   WHERE menu_key = 'ia_copie_use';
UPDATE public.menu_config SET label = 'Explorar'          WHERE menu_key = 'inicio_central';
