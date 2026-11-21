#!/usr/bin/env python3
"""Local PostgreSQL 17 integration tests. No hosted service or customer data."""
import os, subprocess, time
from pathlib import Path
root = Path(__file__).resolve().parents[1]
name = f'pawstreak-qa-{os.getpid()}'
image = 'postgres:17-alpine@sha256:526f86d93c6ea08fd3f1fe5605650cacc781b2c6013169a0ad8f42c7d3d84f32'
def sql(path):
    result = subprocess.run(['docker','exec','-i',name,'psql','-U','postgres','-v','ON_ERROR_STOP=1'], input=path.read_text(), text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(f'{path.name}: {result.stderr}')
    print(f'PASS {path.name}', flush=True)
    if path.name.endswith('checks.sql'): print(result.stderr, flush=True)
try:
    subprocess.run(['docker','run','--name',name,'--rm','-d','--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust',image],check=True,stdout=subprocess.DEVNULL)
    for attempt in range(80):
        result=subprocess.run(['docker','exec',name,'pg_isready','-U','postgres'],capture_output=True)
        if result.returncode == 0: break
        time.sleep(.25)
    else: raise RuntimeError('Local database did not become ready')
    sql(root/'qa/sql/local-bootstrap.sql')
    for path in sorted((root/'supabase/migrations').glob('*.sql')):
        if int(path.name.split('_')[0]) <= 19: sql(path)
    sql(next((root/'supabase/migrations').glob('*_harden_pack_function_permissions.sql')))
    sql(next((root/'supabase/migrations').glob('*_walk_routes_and_memory_video.sql')))
    sql(next((root/'supabase/migrations').glob('*_native_push_devices.sql')))
    sql(root/'qa/sql/permission-and-media-checks.sql')
finally:
    subprocess.run(['docker','rm','-f',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
