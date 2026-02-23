import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { MaskPass, ClearMaskPass } from 'three/addons/postprocessing/MaskPass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';

const THREEGlobal = {
  ...THREE,
  EffectComposer,
  RenderPass,
  ShaderPass,
  MaskPass,
  ClearMaskPass,
  CopyShader
};

window.THREE = THREEGlobal;
