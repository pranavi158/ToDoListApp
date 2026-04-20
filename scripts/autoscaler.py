import docker
import time
import os
import sys

# Configuration from environment variables
SERVICE_NAME = os.getenv('SERVICE_NAME', 'backend')
CPU_THRESHOLD = float(os.getenv('CPU_THRESHOLD', 70.0))
MIN_REPLICAS = int(os.getenv('MIN_REPLICAS', 1))
MAX_REPLICAS = int(os.getenv('MAX_REPLICAS', 5))
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', 30))

client = docker.from_env()

def get_service_replicas(service_name):
    """
    In Docker Compose, services are containers with labels.
    We'll find containers with the label 'com.docker.compose.service' = service_name
    """
    containers = client.containers.list(filters={
        'label': f'com.docker.compose.service={service_name}',
        'status': 'running'
    })
    return containers

def calculate_cpu_usage(container):
    """
    Get CPU usage percentage for a container.
    This reads from container.stats() which is a stream, so we take one sample.
    """
    stats = container.stats(stream=False)
    
    cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - \
                stats['precpu_stats']['cpu_usage']['total_usage']
    system_delta = stats['cpu_stats']['system_cpu_usage'] - \
                   stats['precpu_stats']['system_cpu_usage']
    
    number_cpus = stats['cpu_stats']['online_cpus']
    
    if system_delta > 0.0 and cpu_delta > 0.0:
        return (cpu_delta / system_delta) * number_cpus * 100.0
    return 0.0

def scale_service(target_replicas):
    """
    To scale in Docker Compose via python without the docker-compose CLI easily,
    it's usually best to use the docker-compose command if available,
    OR manually create/remove containers.
    
    Since we are inside a container, calling 'docker-compose' requires the binary.
    A simpler 'local' way is to just print that scaling is needed if we don't want to 
    embed the compose binary, but the plan promised execution.
    We'll assume the autoscaler container has 'docker-compose' OR we use the docker API to scale.
    
    Actually, Docker Compose V2 is often just 'docker compose'.
    We will use a subprocess call to 'docker compose' which works if the binary is in the image.
    """
    import subprocess
    print(f"Scaling {SERVICE_NAME} to {target_replicas} replicas...")
    try:
        # We need to be in the project directory for this to work perfectly, 
        # or use -p project_name / -f file
        subprocess.run(['docker', 'compose', 'up', '-d', '--scale', f'{SERVICE_NAME}={target_replicas}'], check=True)
    except Exception as e:
        print(f"Failed to scale: {e}")

def main():
    print(f"Autoscaler started for service: {SERVICE_NAME}")
    print(f"Threshold: {CPU_THRESHOLD}%, Min: {MIN_REPLICAS}, Max: {MAX_REPLICAS}")
    
    while True:
        try:
            containers = get_service_replicas(SERVICE_NAME)
            current_count = len(containers)
            
            if current_count == 0:
                print(f"No running containers for {SERVICE_NAME}. Skipping...")
                time.sleep(CHECK_INTERVAL)
                continue

            total_cpu = 0
            for container in containers:
                usage = calculate_cpu_usage(container)
                total_cpu += usage
            
            avg_cpu = total_cpu / current_count
            print(f"Current Replicas: {current_count}, Avg CPU: {avg_cpu:.2f}%")

            if avg_cpu > CPU_THRESHOLD and current_count < MAX_REPLICAS:
                scale_service(current_count + 1)
            elif avg_cpu < (CPU_THRESHOLD / 3) and current_count > MIN_REPLICAS:
                # Simple down-scaling logic: if usage is less than 1/3 of threshold
                scale_service(current_count - 1)

        except Exception as e:
            print(f"Error in autoscaler loop: {e}")
            
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
