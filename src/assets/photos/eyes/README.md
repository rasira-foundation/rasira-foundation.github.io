Drop the eye photos here. Any .jpg / .png / .webp in this folder is picked up
automatically by the hero strip — see HeroEyes.tsx, which globs this
directory rather than importing files by name, so adding or removing a photo
needs no code change.

Use FULL portraits, not pre-cropped eyes. The strip crops to the eye line
itself with object-fit/object-position, so a full frame gives it room to sit
the crop correctly; a tight crop has none. If a particular photo's eyes are
not centred by the default, add an entry to EYE_FOCUS in HeroEyes.tsx keyed
by filename.
