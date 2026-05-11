# Discord RSS bot

## Limitation

If the RSS feed you want to monitor is particularly active, it might end up missing items, due to polling only returning a certain amount of recent items.
This is a known limitation to RSS.
You can compensate by changing the feedinterval in the code, but I've set it to 15/30/60 minutes to limit the amount of polling it does, to avoid any potential rate limits and such.
if you do change it, be reasonable.
