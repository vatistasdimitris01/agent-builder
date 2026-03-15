export const PANDA_ART = {
  small: `
   (•ᴥ•)
  `,
  medium: `
    __
   (o o)
   ( v )
  `,
  large: `
      _     _ 
     (o)___(o)
     /       \\
    /  ^ _ ^  \\
   (   (o o)   )
    \\___(_)___/
  `
};

export const getPandaArt = (size = 'medium') => {
  return PANDA_ART[size] || PANDA_ART.medium;
};
