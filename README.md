![HS-Logo](https://cdn.discordapp.com/attachments/1067064704712843335/1142761104716603432/var_1.png)
# Horizon Simulations 787-9

We want to welcome you to the Horizon Simulations 787-900, this is a modified version of the default 787-10 that asobo offers with the premium delux version, as such you **MUST** own the premium deluxe version of Microsoft Flight Simulator in order to use this aircraft. We have also expanded upon this aircraft to ensure a better simulation of the aircraft.

### Boeing 787-9

```
Model  B787-9
Engine Rolls Royce Trent 1000
APU    APS5000
FMS
```
## Insert credits or whatever

## Developer Section
### Requirements
    WSL2 
    python
    NodeJs v16
### How to build
To set up your enviroment run: 
```shell
npm i
```
#### Models
1. First you will need to run:
```shell
npm run build-HS780:models
```
2. Then you will need to navigate to the folder: HorizonSim-789/src/models/build
3. Find the B787_lod1.gltf and open it in VS code
4. Press Alt+Shift+F and save it once it has finished refatoring
5. run:
```shell
cd HorizonSim-789/src/models/build
python replace.py
```
DONE!

#### Plane
run:
```shell
npx igniter
```
DONE!

## License Information

This repository and it's contents are dual-licensed, with a unique set of terms applied to the original textural-form source code and the artistic assets, respectively.

### GNU General Pulic License version 3 (GNU GPLv3)

The GNU General Public License is a free, copyleft license for software and other kinds of works.

The licenses for most software and other practical works are designed to take away your freedom to share and change the works. By contrast, the GNU General Public License is intended to guarantee your freedom to share and change all versions of a program--to make sure it remains free software for all its users. We, the Free Software Foundation, use the GNU General Public License for most of our software; it applies also to any other work released this way by its authors. You can apply it to your programs, too.

When we speak of free software, we are referring to freedom, not price. Our General Public Licenses are designed to make sure that you have the freedom to distribute copies of free software (and charge for them if you wish), that you receive source code or can get it if you want it, that you can change the software or use pieces of it in new free programs, and that you know you can do these things.

To protect your rights, we need to prevent others from denying you these rights or asking you to surrender the rights. Therefore, you have certain responsibilities if you distribute copies of the software, or if you modify it: responsibilities to respect the freedom of others.

For example, if you distribute copies of such a program, whether gratis or for a fee, you must pass on to the recipients the same freedoms that you received. You must make sure that they, too, receive or can get the source code. And you must show them these terms so they know their rights.

Developers that use the GNU GPL protect your rights with two steps: (1) assert copyright on the software, and (2) offer you this License giving you legal permission to copy, distribute and/or modify it.

For the developers' and authors' protection, the GPL clearly explains that there is no warranty for this free software. For both users' and authors' sake, the GPL requires that modified versions be marked as changed, so that their problems will not be attributed erroneously to authors of previous versions.

Some devices are designed to deny users access to install or run modified versions of the software inside them, although the manufacturer can do so. This is fundamentally incompatible with the aim of protecting users' freedom to change the software. The systematic pattern of such abuse occurs in the area of products for individuals to use, which is precisely where it is most unacceptable. Therefore, we have designed this version of the GPL to prohibit the practice for those products. If such problems arise substantially in other domains, we stand ready to extend this provision to those domains in future versions of the GPL, as needed to protect the freedom of users.

Finally, every program is threatened constantly by software patents. States should not allow patents to restrict development and use of software on general-purpose computers, but in those that do, we wish to avoid the special danger that patents applied to a free program could make it effectively proprietary. To prevent this, the GPL assures that patents cannot be used to render the program non-free.

The precise terms and conditions for copying, distribution and modification follow.

### Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License(CC BY-NC 4.0)

Insert License here

### Game Content User

The Horizon Simulations 787-9 was created under the Microsoft's "Game Content Usage RUles" using assets from Microsoft Flight Simulator 2020. It is not affiliated, associated, authorized, ednorsed by with Mictosoft

### Disclamer

We are not affiliated, associated, authorized, ednorsed by, or in any way officially conected to the Boeing brand or any of it's subsidiaries

### Overall

Content within distribution packages built from the soures in this repository are licensed as follows:
- Original source code or complicated artifacts from Horizon simulatons: GNU GPLv3.
- Original assets from Horizon simulations or Qbit simulations: CC BY-NC 4.0.
- Assets covered by the "Game Content Usage RUles": Under the license granted by those rules.

## Qbit Simulations
This project is actively supported by the Qbit Simulations Team who work on the following areas actively:
- Modeling
- Texture design
- Paint Kit development
- Ecosystem setup
- Comprehensive building process powered by Igniter, a FlyByWire Simulations product.
