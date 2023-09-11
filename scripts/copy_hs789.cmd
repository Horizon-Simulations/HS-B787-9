@echo off
del "./horizonsim-789/build/." /q
rmdir "./horizonsim-789/build" /q

mkdir "./horizonsim-789/build"
Xcopy "./horizonsim-789/src/base/." "./horizonsim-789/build/." /y/e/h 





