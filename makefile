# --- Makefile para Windows (CMD) ---
TIC="D:\Apps\tic80\tic80.exe"
OUTPUT=main_build.js
CART=juego.tic

all: $(OUTPUT) run

$(OUTPUT):
	@echo Creando main_build.js...
	
	type header.js > $(OUTPUT)
	@echo. >> $(OUTPUT)
	
	@echo Agregando Logica...
	type classes\mazo.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\caballo.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\model.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	
	@echo Agregando Escenas...
	type classes\ui_bet.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui_race.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui_finish.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui_menu.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui_scores.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui_name.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type classes\ui_quit.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	
	@echo Agregando Main y Footer...
	type main.js >> $(OUTPUT)
	@echo. >> $(OUTPUT)
	type footer.js >> $(OUTPUT)
	
	@echo Archivos combinados EXITOSAMENTE en $(OUTPUT)

run:
	$(TIC) --fs "." --cmd "new js & import code $(OUTPUT) & import tiles tiles.png & import sprites sprites.png & import map map.map & load base_audio.tic sfx & load base_audio.tic music & save $(CART) & run"
	@echo Ejecutando $(CART)

clean:
	del /f /q $(OUTPUT) $(CART) 2>nul
	@echo Archivos eliminados
	
html:
	@echo 1. Construyendo el cartucho maestro...
	$(TIC) --fs "." --cli --cmd "new js & import code $(OUTPUT) & import tiles sprites.png & import map pista.map & load base_audio.tic sfx & load base_audio.tic music & save $(CART) & exit"
	
	@echo 2. Exportando a HTML...
	$(TIC) --fs "." --cli --cmd "load $(CART) & export html index.html & exit"
	
	@echo ¡Listo!