import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Replace img
old_img = """          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || ""}
              className="w-8 h-8 rounded-full border border-border cursor-pointer"
              onClick={handleSignOut}
              title="Click to sign out"
            />
          ) : ("""

new_img = """          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || ""}
              className="w-8 h-8 rounded-full border border-border cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              onClick={handleSignOut}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSignOut() }}
              title="Click to sign out"
              role="button"
              tabIndex={0}
            />
          ) : ("""

content = content.replace(old_img, new_img)

# Replace fallback button
old_button = """          ) : (
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full bg-accent-muted text-accent font-display text-sm flex items-center justify-center"
            >"""

new_button = """          ) : (
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full bg-accent-muted text-accent font-display text-sm flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              aria-label="Sign out"
            >"""

content = content.replace(old_button, new_button)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
