# BN12 - Strategy Notes
The BN12 Challenge is to destroy the bitnode 50 times, which is about 30 times more
than I have completes all the other bitnodes combined. The challenge is obviously to 
automate the destruction of the bitnode. 

I already have scripts that manage combat gangs and can complete the bladeburner 
black ops missions, so the strategy will be to use gangs for income and augmentations
and work towards a bladeburner victory.

## Phase I: Initial Setup
The bitnode starts with a one working hacknet node, and 256 GB of RAM. The objective is
in this phase is to create a gang, join the blade burner division, and have all sleeves
recovered from shock. We will also need at least 1TB of home RAM to run all of our scripts.

1) Clear the cache and reset stored variables.
2) Sell hashes on a loop.
3) Set sleeves to working out all 4 combat skills
4) Set main to working out at powergym to increase each combat skill to 100
5) Join the blade burner division
6) Set all sleeves to committing homicide
7) Set main to committing homicide
8) When at -54000 karma create the gang. 
9) Start bladeburner script
10) Start gang management script.
11) Set sleeves to shock recovery
12) At $500m buy tor, and all the darkweb programs.
13) Purchase RAM upgrade
14) Start stock management script.
15) Start the remote hacking scripts, and fucking joes guns
16) Install augmentations and start phase II when the following is true:
    - Purchased The Blade's Simulacrum $150b
    - Purchased EsperTech Bladeburner Eyewear
    - EMS-4 Recombination
    - All sleeves have recovered from shock
    - Home has been upgraded to 1.02 TB RAM
    - All stock exchange upgrades are purchased.

## Phase II: Level up main
In this phase we focus on purchasing all the bladeburner augmentations for main, upgrading our
sleeves with the easily attainable augmentations, and getting 100% gang territory.

1) Reset stored variables tracking things that reset with install, like server preparedness
2) Kick off stock manager
3) Kick off gang manager
4) Kick off bladeburner manager
5) Send two sleeves to volhaven
6) set 4 sleeves to working out
7) set the 2 volhaven sleeves to taking classes
8) set final 2 sleeves to committing homicides for now
9) At $20t saved buy all the bladeburner augmentations
10) Upgrade sleeves with all augmentations less than $1t
11) While waiting for 100% territory continue to buy RAM, Cores, and affordable augmentations


## Phase III: Go for the Kill

1) 

# Architecture

## Modules
All scripts for this project will follow the following naming convention: bn12-{purpose}.js
Any existing scripts used for this purpose will be copied to the satisfy this convention

- bn12-lib.js - common library of functions 
- bn12-init.js - clears cache and initializes persistent storage, starts phase I
- bn12-phase-1.js - phase I runner
- bn12-phase-2.js - phase II runner
- bn12-phase-3.js - phase III runner
- bn12-grow-bad-karma.js - start killing 
- bn12-stock-trader.js - stock management script
- bn12-bladeburner-manager.js - bladeburner runner
- bn12-gang-manager.js - gang management
- bn12-sleeve-manager.js - sleeve management


# Development Notes

- prepare server script interferes with bb and stock master scripts, need to dial back memory usage. Always keep 500GB for base functionality. 1TB is a minimum for 


# Stock Market
The following is a list of stock symbols used in the game. Match this up with servers then 
manipulate the marker.
```
Stock	Price cap
ECP	$293.560m
MGCP	$746.875m
BLD	$188.735m
CLRK	$97.050m
OMTK	$151.396m
FSIG	$1.618b
KGI	$130.010m
FLCM	$399.221m
STM	$401.083m
DCOMM	$8.550m
HLS	$143.919m
VITA	$78.702m
ICRS	$230.319m
UNV	$121.094m
AERO	$196.436m
OMN	$183.142m
SLRS	$134.831m
GPH	$183.901m
NVMD	$529.017m
WDS	$78.853m
LXO	$114.307m
RHOC	$142.422m
APHE	$18.095m
SYSC	$51.013m
CTK	$29.097m
NTLK	$14.636m
OMGA	$149.750m
FNS	$29.950m
SGC	$34.214m
JGN	$16.109m
CTYS	$21.743m
MDYN	$227.180m
TITN	$171.616m
```