# --- Makefile para Windows (CMD) ---
TIC="D:\Apps\tic80\tic80.exe"
OUTPUT=main_build.js
CART=juego.tic

all: $(OUTPUT) run

$(OUTPUT):
	type header.js > $(OUTPUT)
	for %%f in (classes\*.js) do type "%%f" >> $(OUTPUT)
	type main.js >> $(OUTPUT)
	type footer.js >> $(OUTPUT)
	@echo Archivos combinados en $(OUTPUT)

run:
	$(TIC) --fs "." --cmd "new js & import code $(OUTPUT) & save $(CART) & run"
	@echo Ejecutando $(CART)

clean:
	del /f /q $(OUTPUT) $(CART) 2>nul
	@echo Archivos eliminados
