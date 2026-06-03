import bpy
import math

# ============================================================
# 1. WORLD BACKGROUND - Deep purple-black night sky
# ============================================================
world = bpy.data.worlds.get("World")
if world is None:
    world = bpy.data.worlds.new("World")
bpy.context.scene.world = world

world.use_nodes = True
tree = world.node_tree
tree.nodes.clear()

bg_node = tree.nodes.new(type="ShaderNodeBackground")
bg_node.inputs["Color"].default_value = (0.015, 0.01, 0.04, 1.0)
bg_node.inputs["Strength"].default_value = 0.5

output_node = tree.nodes.new(type="ShaderNodeOutputWorld")
tree.links.new(bg_node.outputs["Background"], output_node.inputs["Surface"])

# ============================================================
# 2. EEVEE RENDER SETTINGS
# ============================================================
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'

eevee = scene.eevee

try:
    eevee.use_bloom = True
    eevee.bloom_threshold = 0.5
    eevee.bloom_intensity = 0.4
    eevee.bloom_radius = 6.5
except Exception:
    pass

try:
    eevee.use_ssr = True
except Exception:
    pass

try:
    eevee.fast_gi_method = 'GLOBAL_ILLUMINATION'
except Exception:
    pass

try:
    eevee.direct_light_intensity = 2.0
    eevee.indirect_light_intensity = 1.5
except Exception:
    pass

# ============================================================
# 3. LIGHTING
# ============================================================
root = bpy.data.objects.get("Airport_Root")

# --- Sun light ---
bpy.ops.object.light_add(type='SUN', location=(0, -300, 500))
sun = bpy.context.active_object
sun.name = "Sun_Light"
sun.data.energy = 3.0
sun.data.color = (0.9, 0.8, 1.0)
sun.rotation_euler = (math.radians(50), 0, math.radians(30))
sun.parent = root

# --- Area fill light ---
bpy.ops.object.light_add(type='AREA', location=(0, 0, 300))
area = bpy.context.active_object
area.name = "Area_Fill"
area.data.energy = 80000
area.data.size = 800
area.data.color = (0.8, 0.7, 1.0)
area.parent = root

# --- Pink accent ---
bpy.ops.object.light_add(type='POINT', location=(-300, -200, 50))
pink = bpy.context.active_object
pink.name = "Accent_Pink"
pink.data.energy = 5000
pink.data.color = (1.0, 0.2, 0.5)
pink.parent = root

# --- Cyan accent ---
bpy.ops.object.light_add(type='POINT', location=(300, -200, 50))
cyan = bpy.context.active_object
cyan.name = "Accent_Cyan"
cyan.data.energy = 5000
cyan.data.color = (0.0, 0.9, 1.0)
cyan.parent = root

# --- Warm orange ---
bpy.ops.object.light_add(type='POINT', location=(0, 200, 50))
orange = bpy.context.active_object
orange.name = "Accent_Orange"
orange.data.energy = 3000
orange.data.color = (1.0, 0.5, 0.0)
orange.parent = root

# ============================================================
# 4. COMPOSITOR - Glare / Glow + Color Balance
# ============================================================
scene.use_nodes = True
comp_tree = scene.node_tree
comp_tree.nodes.clear()

# Render Layers
rl_node = comp_tree.nodes.new(type="CompositorNodeRLayers")
rl_node.location = (-400, 0)

# Glare
glare_node = comp_tree.nodes.new(type="CompositorNodeGlare")
glare_node.location = (0, 0)
glare_node.glare_type = 'FOG_GLOW'
glare_node.quality = 'HIGH'
glare_node.threshold = 0.5
glare_node.size = 6

# Color Balance - purple/magenta push in highlights
cb_node = comp_tree.nodes.new(type="CompositorNodeColorBalance")
cb_node.location = (300, 0)
cb_node.correction_method = 'LIFT_GAMMA_GAIN'
# Slight magenta/purple push on highlights (gain)
cb_node.gain = (1.05, 0.92, 1.12)

# Composite
comp_node = comp_tree.nodes.new(type="CompositorNodeComposite")
comp_node.location = (600, 100)

# Viewer
viewer_node = comp_tree.nodes.new(type="CompositorNodeViewer")
viewer_node.location = (600, -100)

# Link: Render Layers -> Glare -> Color Balance -> Composite + Viewer
comp_tree.links.new(rl_node.outputs["Image"], glare_node.inputs["Image"])
comp_tree.links.new(glare_node.outputs["Image"], cb_node.inputs["Image"])
comp_tree.links.new(cb_node.outputs["Image"], comp_node.inputs["Image"])
comp_tree.links.new(cb_node.outputs["Image"], viewer_node.inputs["Image"])

# ============================================================
# 5. RENDER RESOLUTION
# ============================================================
scene.render.resolution_x = 3840
scene.render.resolution_y = 2160
scene.render.resolution_percentage = 100

# ============================================================
# 6. CAMERA
# ============================================================
bpy.ops.object.camera_add(location=(0, -800, 600))
cam = bpy.context.active_object
cam.name = "Main_Camera"
cam.data.lens = 28
cam.data.clip_end = 50000

# Point camera at origin
direction = cam.location.copy()
direction.negate()
rot_quat = direction.to_track_quat('-Z', 'Y')
cam.rotation_euler = rot_quat.to_euler()

scene.camera = cam

print("Synthwave airport terminal scene setup complete.")
